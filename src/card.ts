import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, hasConfigOrEntityChanged, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';

import type { HumidifierControlCardConfig } from './types';
import { localize } from './localize/localize';
import './controls/button-control';
import './controls/timer-select-control';

@customElement('humidifier-control-card')
export class HumidifierControlCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import('./editor');
    return document.createElement('humidifier-control-card-editor');
  }

  public static getStubConfig(hass: HomeAssistant): Record<string, unknown> {
    const entities = Object.keys(hass.states);
    const humidifierEntity = entities.find((e) => e.startsWith('humidifier.'));
    return {
      type: 'custom:humidifier-control-card',
      entity: humidifierEntity || '',
    };
  }

  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private config!: HumidifierControlCardConfig;

  public setConfig(config: HumidifierControlCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (!config.entity) {
      throw new Error(localize('common.missing_entity') + ': entity');
    }

    this.config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.config) {
      return false;
    }

    return hasConfigOrEntityChanged(this, changedProps, true);
  }

  public getCardSize(): number {
    return 2;
  }

  private _resolveEntities(mainEntity: any): {
    humidityState: any;
    targetState: any | null;
    mistState: any;
    waterState: any | null;
    overrideTimerState: any | null;
    overrideOptionsState: any | null;
    name: string;
    icon: string;
  } | null {
    const entityId = this.config.entity;
    const baseName = entityId.split('.')[1];

    // Resolve name
    const name = this.config.name || mainEntity.attributes?.friendly_name || 'Humidifier';

    // Resolve icon
    const icon = this.config.icon || 'mdi:air-humidifier';

    // Resolve humidity sensor
    let humidityState: any = null;
    if (this.config.humidity_sensor) {
      humidityState = this.hass.states[this.config.humidity_sensor];
    } else {
      // Use humidifier's current_humidity attribute
      const currentHumidity = mainEntity.attributes?.current_humidity;
      if (currentHumidity !== undefined) {
        // Create a virtual state for the humidity reading
        humidityState = {
          state: currentHumidity.toString(),
          entity_id: entityId,
          attributes: {},
        };
      } else {
        // Try to find a humidity sensor with similar name
        humidityState = this._findEntity('sensor', baseName, 'humidity');
      }
    }

    // Resolve target humidity
    let targetState: any = null;
    if (this.config.target_humidity) {
      targetState = this.hass.states[this.config.target_humidity];
    }

    // Resolve fan speed
    let mistState: any = null;
    if (this.config.fan_speed) {
      mistState = this.hass.states[this.config.fan_speed];
    } else {
      // Check if humidifier has a fan entity
      const fanEntity = this._findEntity('fan', baseName);
      if (fanEntity) {
        mistState = fanEntity;
      } else {
        // Try to find a number entity for fan speed (also search for mist/level)
        mistState = this._findEntity('number', baseName, 'mist|level');
      }
    }

    // Resolve water sensor
    let waterState: any = null;
    if (this.config.water_sensor) {
      waterState = this.hass.states[this.config.water_sensor];
    } else {
      waterState = this._findEntity('binary_sensor', baseName, 'water');
    }

    // Resolve override timer
    let overrideTimerState: any = null;
    if (this.config.override_timer) {
      overrideTimerState = this.hass.states[this.config.override_timer];
    }

    // Resolve override timer options
    let overrideOptionsState: any = null;
    if (this.config.override_timer_options) {
      overrideOptionsState = this.hass.states[this.config.override_timer_options];
    }

    // If target state or override time or override options is not provided, force manual mode by clearing override states
    if (!targetState || !overrideTimerState || !overrideOptionsState) {
      overrideTimerState = null;
      overrideOptionsState = null;
    }

    // Check if all required entities are found
    if (!humidityState || !mistState) {
      return null;
    }

    return {
      humidityState,
      targetState,
      mistState,
      waterState,
      overrideTimerState,
      overrideOptionsState,
      name,
      icon,
    };
  }

  private _findEntity(domain: string, baseName: string, keywords?: string): any {
    const entities = Object.keys(this.hass.states).filter((e) => e.startsWith(domain + '.'));

    // Try to find entity with matching base name
    let found = entities.find((e) => e.includes(baseName));

    // If keywords provided, further filter by keywords
    if (found && keywords) {
      const keywordArray = keywords.split('|');
      const withKeywords = entities.filter((e) => {
        const lower = e.toLowerCase();
        return lower.includes(baseName) && keywordArray.some((kw) => lower.includes(kw.toLowerCase()));
      });
      if (withKeywords.length > 0) {
        found = withKeywords[0];
      }
    }

    // If still not found but keywords provided, try just keywords
    if (!found && keywords) {
      const keywordArray = keywords.split('|');
      found = entities.find((e) => {
        const lower = e.toLowerCase();
        return keywordArray.some((kw) => lower.includes(kw.toLowerCase()));
      });
    }

    return found ? this.hass.states[found] : null;
  }

  private _openMoreInfo(entityId: string): void {
    fireEvent(this, 'hass-more-info', { entityId });
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this.config) {
      return html``;
    }

    const mainEntity = this.hass.states[this.config.entity];
    if (!mainEntity) {
      return html` <ha-card> <div class="card-content">${localize(
        'ui.entity_not_found',
        this.config.entity,
      )}</div> </ha-card> `;
    }

    // Discover or use configured entities
    const resolvedConfig = this._resolveEntities(mainEntity);
    if (!resolvedConfig) {
      return html` <ha-card> <div class="card-content">${localize('ui.unable_to_resolve_entities')}</div> </ha-card> `;
    }

    const { humidityState, targetState, mistState, waterState, overrideTimerState, overrideOptionsState, name, icon } =
      resolvedConfig;

    const isUnavailable = humidityState.state === 'unavailable' || humidityState.state === 'unknown';
    const isWaterLow = waterState ? waterState.state === 'on' : false;
    // Force manual mode if target, timer, or options are missing
    const isTimerActive = (targetState && overrideTimerState && overrideOptionsState)
      ? overrideTimerState.state !== 'idle'
      : true;

    const mistMin = mistState.attributes?.min ?? 1;
    const mistMax = mistState.attributes?.max ?? 100;
    const mistCurrent = parseFloat(mistState.state);

    return html`
      <ha-card>
        <div class="card-content">
          <!-- Header with current humidity -->
          <div class="header-row">
            <div class="title-row" @click=${() => this._openMoreInfo(this.config.entity)}>
              <ha-icon icon="${icon}"></ha-icon>
              <span class="title">${name}</span>
            </div>
            ${isWaterLow ? html` <ha-icon class="water-alert-icon" icon="mdi:water-alert"></ha-icon> ` : ''}
            <div class="humidity-display" @click=${() => this._openMoreInfo(humidityState.entity_id)}>
              <span class="humidity-value ${isUnavailable ? 'unavailable' : ''}"
                >${humidityState.state}${isUnavailable ? '' : '%'}</span
              >
            </div>
          </div>

          <!-- Target Humidity -->
          ${targetState ? html`
          <div class="control-row">
            <span class="control-label">${localize('state.target')}</span>
            <humidifier-button-control
              .hass=${this.hass}
              .entity=${targetState.entity_id}
              .value=${parseFloat(targetState.state)}
              .min=${targetState.attributes?.min ?? 0}
              .max=${targetState.attributes?.max ?? 100}
              .step=${targetState.attributes?.step ?? 1}
              .unit=${'%'}
            ></humidifier-button-control>
          </div>
          ` : ''}

          <!-- Override Timer -->
          ${overrideOptionsState ? html`
          <div class="control-row">
            <span class="control-label">${localize('state.override')}</span>
            <humidifier-timer-select-control
              .hass=${this.hass}
              .entity=${overrideOptionsState.entity_id}
              .value=${overrideOptionsState.state}
              .options=${overrideOptionsState.attributes?.options ?? []}
            ></humidifier-timer-select-control>
          </div>
          ` : ''}

          <!-- Fan Speed -->
          <div class="control-row mist-row">
            <span class="control-label">${localize('state.fan_speed')}</span>
            ${
              isTimerActive
                ? html`
                  <humidifier-button-control
                    .hass=${this.hass}
                    .entity=${mistState.entity_id}
                    .value=${mistCurrent}
                    .min=${mistMin}
                    .max=${mistMax}
                    .step=${mistState.attributes?.step ?? 1}
                    .unit=${''}
                  ></humidifier-button-control>
                `
                : html`<div class="mist-display">${this._renderMistIcons(mistCurrent, mistMin, mistMax)}</div>`
            }
          </div>
        </div>
      </ha-card>
    `;
  }

  private _renderMistIcons(current: number, min: number, max: number): TemplateResult {
    const fillCount = Math.round(((current - min) / (max - min)) * 5);
    const icons: TemplateResult[] = [];

    for (let i = 0; i < 5; i++) {
      icons.push(
        html` <ha-icon
          class="mist-icon ${i < fillCount ? 'active' : ''}"
          icon=${i < fillCount ? 'mdi:water' : 'mdi:water-outline'}
        ></ha-icon> `,
      );
    }

    return html`${icons}`;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --control-height: 42px;
        --control-border-radius: 12px;
        --rgb-state-humidifier: 33, 150, 243;
      }

      ha-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .card-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      /* Header */
      .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .title-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        cursor: pointer;
      }

      .title-row ha-icon {
        --mdc-icon-size: 24px;
        color: rgb(var(--rgb-state-humidifier));
      }

      .title {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .humidity-display {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .humidity-value {
        font-size: 24px;
        font-weight: 500;
        color: var(--primary-text-color);
      }

      .humidity-value.unavailable {
        color: var(--secondary-text-color);
        opacity: 0.5;
      }

      /* Water alert icon */
      .water-alert-icon {
        --mdc-icon-size: 24px;
        color: var(--warning-color, #ff9800);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      /* Control rows */
      .control-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .control-label {
        min-width: 80px;
        font-weight: 500;
        color: var(--secondary-text-color);
        font-size: 14px;
      }

      humidifier-button-control,
      humidifier-timer-select-control {
        flex: 1;
      }

      /* Mist display */
      .mist-row {
        padding: 4px 0;
      }

      .mist-display {
        display: flex;
        gap: 4px;
        flex: 1;
        justify-content: flex-end;
      }

      .automatic-mode {
        flex: 1;
        text-align: right;
        color: var(--secondary-text-color);
        font-style: italic;
        font-size: 14px;
      }

      .mist-icon {
        --mdc-icon-size: 20px;
        color: rgba(var(--rgb-state-humidifier), 0.3);
        transition: color 0.2s;
      }

      .mist-icon.active {
        color: rgb(var(--rgb-state-humidifier));
      }
    `;
  }
}
