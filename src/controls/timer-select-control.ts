import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant, fireEvent } from 'custom-card-helpers';

@customElement('humidifier-timer-select-control')
export class TimerSelectControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public entity!: string;
  @property() public value!: string;
  @property({ type: Array }) public options: string[] = [];

  private _holdTimer?: number;
  private _holding = false;

  private onChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.hass.callService('input_select', 'select_option', {
      entity_id: this.entity,
      option: value,
    });
  }

  private _handleHoldStart(e: Event): void {
    this._holding = false;
    this._holdTimer = window.setTimeout(() => {
      this._holding = true;
      e.preventDefault();
      e.stopPropagation();
      this._openMoreInfo();
    }, 500);
  }

  private _handleHoldEnd(): void {
    if (this._holdTimer) {
      clearTimeout(this._holdTimer);
      this._holdTimer = undefined;
    }
    this._holding = false;
  }

  private _openMoreInfo(): void {
    fireEvent(this, 'hass-more-info', { entityId: this.entity });
  }

  protected render(): TemplateResult {
    return html`
      <select
        class="select-control"
        .value=${this.value}
        @change=${this.onChange}
        @touchstart=${this._handleHoldStart}
        @touchend=${this._handleHoldEnd}
        @mousedown=${this._handleHoldStart}
        @mouseup=${this._handleHoldEnd}
        @mouseleave=${this._handleHoldEnd}
      >
        ${this.options.map(
          (option) => html` <option value=${option} ?selected=${option === this.value}>${option}</option> `
        )}
      </select>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        --mdc-theme-primary: rgb(var(--rgb-state-humidifier, 33, 150, 243));
      }
      .select-control {
        width: 100%;
        height: var(--control-height, 42px);
        padding: 0 32px 0 12px;
        border-radius: var(--control-border-radius, 12px);
        border: none;
        background: rgba(var(--rgb-primary-text-color), 0.05);
        color: var(--primary-text-color);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        outline: none;
        font-family: inherit;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='rgba(128,128,128,0.8)' d='M7,10L12,15L17,10H7Z'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 24px;
      }
      .select-control:focus {
        background: rgba(var(--rgb-primary-text-color), 0.1);
      }
      .select-control option {
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-weight: normal;
      }
    `;
  }
}
