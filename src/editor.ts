import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { HumidifierControlCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators.js';
import { localize } from './localize/localize';

// Hack to load ha-components needed for editor
if (!customElements.get('ha-form') || !customElements.get('hui-card-features-editor')) {
  (customElements.get('hui-tile-card') as any)?.getConfigElement();
}
if (!customElements.get('ha-entity-picker')) {
  (customElements.get('hui-entities-card') as any)?.getConfigElement();
}
if (!customElements.get('ha-card-conditions-editor')) {
  (customElements.get('hui-conditional-card') as any)?.getConfigElement();
}

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

  get _entity(): string {
    return this._config?.entity || '';
  }

  get _icon(): string {
    return this._config?.icon || '';
  }

  get _humidity_sensor(): string {
    return this._config?.humidity_sensor || '';
  }

  get _target_humidity(): string {
    return this._config?.target_humidity || '';
  }

  get _fan_speed(): string {
    return this._config?.fan_speed || '';
  }

  get _water_sensor(): string {
    return this._config?.water_sensor || '';
  }

  get _override_timer(): string {
    return this._config?.override_timer || '';
  }

  get _override_timer_options(): string {
    return this._config?.override_timer_options || '';
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    return html`
      <ha-entity-picker
        label=${localize('config.entity')}
        helper=${localize('config.entity_helper')}
        .hass=${this.hass}
        .value=${this._entity}
        .configValue=${'entity'}
        .includeDomains=${['humidifier']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-textfield
        label=${localize('config.name')}
        helper=${localize('config.name_helper')}
        .value=${this._name}
        .configValue=${'name'}
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-textfield
        label=${localize('config.icon')}
        helper=${localize('config.icon_helper')}
        .value=${this._icon}
        .configValue=${'icon'}
        @input=${this._valueChanged}
      ></ha-textfield>

      <ha-entity-picker
        label=${localize('config.humidity_sensor')}
        helper=${localize('config.humidity_sensor_helper')}
        .hass=${this.hass}
        .value=${this._humidity_sensor}
        .configValue=${'humidity_sensor'}
        .includeDomains=${['sensor']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.target_humidity')}
        helper=${localize('config.target_humidity_helper')}
        .hass=${this.hass}
        .value=${this._target_humidity}
        .configValue=${'target_humidity'}
        .includeDomains=${['input_number']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.fan_speed')}
        helper=${localize('config.fan_speed_helper')}
        .hass=${this.hass}
        .value=${this._fan_speed}
        .configValue=${'fan_speed'}
        .includeDomains=${['number', 'fan']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.water_sensor')}
        helper=${localize('config.water_sensor_helper')}
        .hass=${this.hass}
        .value=${this._water_sensor}
        .configValue=${'water_sensor'}
        .includeDomains=${['binary_sensor']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      ${this._target_humidity ? html`
      <ha-entity-picker
        label=${localize('config.override_timer')}
        helper=${localize('config.override_timer_helper')}
        .hass=${this.hass}
        .value=${this._override_timer}
        .configValue=${'override_timer'}
        .includeDomains=${['timer']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>

      <ha-entity-picker
        label=${localize('config.override_timer_options')}
        helper=${localize('config.override_timer_options_helper')}
        .hass=${this.hass}
        .value=${this._override_timer_options}
        .configValue=${'override_timer_options'}
        .includeDomains=${['input_select']}
        @value-changed=${this._valueChanged}
        allow-custom-entity
      ></ha-entity-picker>
      ` : ''}
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
