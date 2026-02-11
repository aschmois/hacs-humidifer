import { css, CSSResultGroup, html, LitElement, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

@customElement('humidifier-timer-select-control')
export class TimerSelectControl extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property() public entity!: string;
  @property() public value!: string;
  @property({ type: Array }) public options: string[] = [];

  private onChange(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    const domain = this.entity.split('.')[0];
    this.hass.callService(domain, 'select_option', {
      entity_id: this.entity,
      option: value,
    });
  }

  protected render(): TemplateResult {
    return html`
      <select
        class="select-control"
        .value=${this.value}
        @change=${this.onChange}
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
        touch-action: manipulation;
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
