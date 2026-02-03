import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'humidifier-control-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface HumidifierControlCardConfig extends LovelaceCardConfig {
  type: string;
  entity: string; // Main humidifier entity
  name?: string;
  icon?: string;
  humidity_sensor?: string;
  target_humidity?: string;
  fan_speed?: string;
  water_sensor?: string;
  override_timer?: string;
  override_timer_options?: string;
}
