/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, TemplateResult, css, CSSResultGroup } from 'lit';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';

import { ScopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { HumidifierControlCardConfig } from './types';
import { customElement, property, state } from 'lit/decorators';
import { formfieldDefinition } from '../elements/formfield';
import { selectDefinition } from '../elements/select';
import { textfieldDefinition } from '../elements/textfield';
import { localize } from './localize/localize';

@customElement('humidifier-control-card-editor')
export class HumidifierControlCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: HumidifierControlCardConfig;

  @state() private _helpers?: any;

  private _initialized = false;

  static elementDefinitions = {
    ...textfieldDefinition,
    ...selectDefinition,
    ...formfieldDefinition,
  };

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

    const entities = Object.keys(this.hass.states);
    const sensors = entities.filter(e => e.startsWith('sensor.'));
    const inputNumbers = entities.filter(e => e.startsWith('input_number.'));
    const numbers = entities.filter(e => e.startsWith('number.'));
    const binarySensors = entities.filter(e => e.startsWith('binary_sensor.'));
    const inputSelects = entities.filter(e => e.startsWith('input_select.'));

    return html`
      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label=${localize('config.humidity_sensor')}
        .configValue=${'humidity_sensor'}
        .value=${this._humidity_sensor}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${sensors.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label=${localize('config.target_humidity')}
        .configValue=${'target_humidity'}
        .value=${this._target_humidity}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${inputNumbers.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label=${localize('config.mist_level')}
        .configValue=${'mist_level'}
        .value=${this._mist_level}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${numbers.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label=${localize('config.water_sensor')}
        .configValue=${'water_sensor'}
        .value=${this._water_sensor}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${binarySensors.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-select
        naturalMenuWidth
        fixedMenuPosition
        label=${localize('config.override_timer')}
        .configValue=${'override_timer'}
        .value=${this._override_timer}
        @selected=${this._valueChanged}
        @closed=${(ev) => ev.stopPropagation()}
      >
        ${inputSelects.map((entity) => {
          return html`<mwc-list-item .value=${entity}>${entity}</mwc-list-item>`;
        })}
      </mwc-select>

      <mwc-textfield
        label=${localize('config.name')}
        .value=${this._name}
        .configValue=${'name'}
        @input=${this._valueChanged}
      ></mwc-textfield>

      <mwc-textfield
        type="number"
        label=${localize('config.mist_min')}
        .value=${this._mist_min ?? ''}
        .configValue=${'mist_min'}
        @input=${this._valueChanged}
      ></mwc-textfield>

      <mwc-textfield
        type="number"
        label=${localize('config.mist_max')}
        .value=${this._mist_max ?? ''}
        .configValue=${'mist_max'}
        @input=${this._valueChanged}
      ></mwc-textfield>
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
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        let value = target.value;
        // Parse numeric values for mist_min and mist_max
        if (target.configValue === 'mist_min' || target.configValue === 'mist_max') {
          value = target.value ? Number(target.value) : undefined;
        }
        this._config = {
          ...this._config,
          [target.configValue]: value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static styles: CSSResultGroup = css`
    mwc-select,
    mwc-textfield {
      margin-bottom: 16px;
      display: block;
    }
    mwc-formfield {
      padding-bottom: 8px;
    }
  `;
}
