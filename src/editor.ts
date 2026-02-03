import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { HumidifierControlCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from './localize/localize';

@customElement('humidifier-control-card-editor')
export class HumidifierControlCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: HumidifierControlCardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  public setConfig(config: HumidifierControlCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected shouldUpdate(): boolean {
    if (!this._initialized) {
      this._initialize();
    }

    return true;
  }

  get _name(): string {
    return this._config?.name || '';
  }

  get _humidity_sensor(): string {
    return this._config?.humidity_sensor || '';
  }

  get _target_humidity(): string {
    return this._config?.target_humidity || '';
  }

  get _mist_level(): string {
    return this._config?.mist_level || '';
  }

  get _water_sensor(): string {
    return this._config?.water_sensor || '';
  }

  get _override_timer(): string {
    return this._config?.override_timer || '';
  }

  get _mist_min(): number | undefined {
    return this._config?.mist_min;
  }

  get _mist_max(): number | undefined {
    return this._config?.mist_max;
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    return html`
      <ha-entity-picker
        label=${localize('config.humidity_sensor')}
        .hass=${this.hass}
        .value=${this._humidity_sensor}
        .configValue=${'humidity_sensor'}
        .includeDomains=${['sensor']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.target_humidity')}
        .hass=${this.hass}
        .value=${this._target_humidity}
        .configValue=${'target_humidity'}
        .includeDomains=${['input_number']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.mist_level')}
        .hass=${this.hass}
        .value=${this._mist_level}
        .configValue=${'mist_level'}
        .includeDomains=${['number']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.water_sensor')}
        .hass=${this.hass}
        .value=${this._water_sensor}
        .configValue=${'water_sensor'}
        .includeDomains=${['binary_sensor']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.override_timer')}
        .hass=${this.hass}
        .value=${this._override_timer}
        .configValue=${'override_timer'}
        .includeDomains=${['input_select']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-textfield
        label=${localize('config.name')}
        .value=${this._name}
        .configValue=${'name'}
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-textfield
        type="number"
        label=${localize('config.mist_min')}
        .value=${this._mist_min ?? ''}
        .configValue=${'mist_min'}
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-textfield
        type="number"
        label=${localize('config.mist_max')}
        .value=${this._mist_max ?? ''}
        .configValue=${'mist_max'}
        @input=${this._valueChanged}
      ></ha-textfield>
    `;
  }

  private _initialize(): void {
    if (this.hass === undefined) return;
    if (this._config === undefined) return;
    if (this._helpers === undefined) return;
    this._initialized = true;
  }

  private async loadCardHelpers(): Promise<void> {
    this._helpers = await (window as any).loadCardHelpers();
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    const configValue = target.configValue;

    if (!configValue) {
      return;
    }

    let value = ev.detail?.value !== undefined ? ev.detail.value : target.value;

    if (this[`_${configValue}`] === value) {
      return;
    }

    if (value === '' || value === undefined) {
      const tmpConfig = { ...this._config };
      delete tmpConfig[configValue];
      this._config = tmpConfig;
    } else {
      // Parse numeric values for mist_min and mist_max
      if (configValue === 'mist_min' || configValue === 'mist_max') {
        value = value ? Number(value) : undefined;
      }
      this._config = {
        ...this._config,
        [configValue]: value,
      };
    }

    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    ha-entity-picker,
    ha-textfield {
      margin-bottom: 16px;
      display: block;
    }
  `;
}
