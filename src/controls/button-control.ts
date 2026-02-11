import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';

@customElement('humidifier-button-control')
export class ButtonControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: String }) public entity!: string;
  @property({ type: Number }) public value!: number;
  @property({ type: Number }) public min: number = 0;
  @property({ type: Number }) public max: number = 100;
  @property({ type: Number }) public step: number = 1;
  @property({ type: String }) public unit: string = '';

  private _callService(action: 'increment' | 'decrement'): void {
    const domain = this.entity.split('.')[0];

    if (domain === 'input_number') {
      this.hass.callService(domain, action, {
        entity_id: this.entity,
      });
    } else if (domain === 'fan') {
      const newValue = action === 'increment' ? this.value + this.step : this.value - this.step;
      this.hass.callService('fan', 'set_percentage', {
        entity_id: this.entity,
        percentage: Math.min(this.max, Math.max(this.min, newValue)),
      });
    } else {
      const newValue = action === 'increment' ? this.value + this.step : this.value - this.step;
      this.hass.callService(domain, 'set_value', {
        entity_id: this.entity,
        value: Math.min(this.max, Math.max(this.min, newValue)),
      });
    }
  }

  private onIncrement(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this._callService('increment');
  }

  private onDecrement(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this._callService('decrement');
  }

  private _handleValueClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    fireEvent(this, 'hass-more-info', { entityId: this.entity });
  }

  protected render(): TemplateResult {
    return html`
      <div class="container">
        <button
          class="button"
          @click=${this.onDecrement}
          ?disabled=${this.value <= this.min}
          type="button"
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <div
          class="value"
          @click=${this._handleValueClick}
        >
          ${this.value}${this.unit}
        </div>
        <button
          class="button"
          @click=${this.onIncrement}
          ?disabled=${this.value >= this.max}
          type="button"
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --text-color: var(--primary-text-color);
        --icon-color: var(--primary-text-color);
        --bg-color: rgba(var(--rgb-primary-text-color), 0.05);
      }
      .container {
        height: var(--control-height, 42px);
        display: flex;
        align-items: center;
        background: var(--bg-color);
        border-radius: var(--control-border-radius, 12px);
        overflow: hidden;
        touch-action: manipulation;
      }
      .button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: calc(var(--control-height, 42px) * 1);
        height: 100%;
        background: none;
        border: none;
        color: var(--icon-color);
        cursor: pointer;
        transition: background 180ms ease-in-out;
      }
      .button:hover {
        background: rgba(var(--rgb-primary-text-color), 0.1);
      }
      .button:active {
        background: rgba(var(--rgb-primary-text-color), 0.15);
      }
      .button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .button:disabled:hover {
        background: none;
      }
      .button ha-icon {
        --mdc-icon-size: 20px;
      }
      .value {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        color: var(--text-color);
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        height: 100%;
      }
      .value:hover {
        background: rgba(var(--rgb-primary-text-color), 0.05);
      }
    `;
  }
}
