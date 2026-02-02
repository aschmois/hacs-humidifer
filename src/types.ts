import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
  interface HTMLElementTagNameMap {
    'humidifier-control-card-editor': LovelaceCardEditor;
    'hui-error-card': LovelaceCard;
  }
}

export interface HumidifierControlCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  humidity_sensor: string;
  target_humidity: string;
  mist_level: string;
  water_sensor: string;
  override_timer: string;
  mist_min?: number;
  mist_max?: number;
}
