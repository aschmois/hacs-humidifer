# Humidifier Control Card

A custom Home Assistant Lovelace card for controlling humidifiers with override timer and automatic mist adjustment.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

## Features

- **Current Humidity Display**: Large, easy-to-read display of current humidity with unavailable state indicator
- **Target Humidity Control**: Slider to adjust target humidity level
- **Mist Level Visualization**: Visual representation using 5 droplet icons showing current mist intensity
- **Override Timer**: Dropdown selector for manual override duration
- **Automatic/Manual Modes**:
  - Automatic mode: Mist level is read-only and controlled by automation
  - Override mode: Mist level becomes adjustable manually
- **Low Water Alert**: Visual warning banner when water level is low
- **Bilingual Support**: English and Spanish localization

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to "Frontend"
3. Click the 3 dots in the top right corner
4. Select "Custom repositories"
5. Add this repository URL with category "Dashboard"
6. Click "Install"
7. Restart Home Assistant

### Manual Installation

1. Download `humidifier-control-card.js` from the [latest release](https://github.com/aschmois/humidifier-control-card/releases)
2. Copy it to `<config>/www/community/humidifier-control-card/humidifier-control-card.js`
3. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/community/humidifier-control-card/humidifier-control-card.js
    type: module
```

4. Restart Home Assistant

## Configuration

### Basic Configuration

Add the card to your Lovelace dashboard with the following configuration:

```yaml
type: custom:humidifier-control-card
humidity_sensor: sensor.master_thermometer_humidity
target_humidity: input_number.upstairs_humidity
mist_level: number.upstairs_humidifier_mist_level
water_sensor: binary_sensor.upstairs_humidifier_low_water
override_timer: input_select.manual_upstairs_humidity_timer
```

### Full Configuration

```yaml
type: custom:humidifier-control-card
name: Master Bedroom Humidifier
humidity_sensor: sensor.master_thermometer_humidity
target_humidity: input_number.upstairs_humidity
mist_level: number.upstairs_humidifier_mist_level
water_sensor: binary_sensor.upstairs_humidifier_low_water
override_timer: input_select.manual_upstairs_humidity_timer
mist_min: 1
mist_max: 9
```

### Configuration Options

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | string | Yes | - | Must be `custom:humidifier-control-card` |
| `humidity_sensor` | string | Yes | - | Entity ID of the humidity sensor |
| `target_humidity` | string | Yes | - | Entity ID of the target humidity input_number |
| `mist_level` | string | Yes | - | Entity ID of the mist level number entity |
| `water_sensor` | string | Yes | - | Entity ID of the low water binary_sensor |
| `override_timer` | string | Yes | - | Entity ID of the override timer input_select |
| `name` | string | No | `Humidifier` | Name displayed in the card header |
| `mist_min` | number | No | 1 | Minimum mist level (fallback if entity attribute not available) |
| `mist_max` | number | No | 100 | Maximum mist level (fallback if entity attribute not available) |

### Required Entities

You need to set up the following entities in your Home Assistant configuration:

1. **Humidity Sensor** (`sensor.*`): Current humidity reading
2. **Target Humidity** (`input_number.*`): Desired humidity level
3. **Mist Level** (`number.*`): Humidifier mist intensity control
4. **Water Sensor** (`binary_sensor.*`): Low water indicator
5. **Override Timer** (`input_select.*`): Timer for manual override with options like:
   - `Off`
   - `1 minute`
   - `5 minutes`
   - `30 minutes`
   - `1 hour`
   - `24 hours`
   - `Forever`

## How It Works

### Automatic Mode

When the override timer is set to "Off", the card displays:
- Current humidity (read-only)
- Target humidity (adjustable)
- Mist level visualization (read-only, shows "Automatic")
- Override timer dropdown (to enable manual control)

In this mode, your Home Assistant automations control the mist level based on the current and target humidity.

### Override Mode

When the override timer is set to any value other than "Off":
- Current humidity (read-only)
- Target humidity (adjustable)
- Mist level visualization with slider (adjustable)
- Override timer dropdown (shows current override duration)

The card allows manual control of the mist level until the timer expires or is set back to "Off".

## Development

### Prerequisites

- Node.js and npm installed
- Home Assistant instance for testing

### Setup

```bash
npm install
```

### Development Server

```bash
npm start
```

This will start a development server on `http://localhost:5000/humidifier-control-card.js`

Add this to your Home Assistant Lovelace resources for testing:

```yaml
resources:
  - url: http://YOUR_DEV_MACHINE_IP:5000/humidifier-control-card.js
    type: module
```

### Build

```bash
npm run build
```

The compiled file will be in `dist/humidifier-control-card.js`

## Screenshots

_Coming soon_

## Support

If you have questions or issues, please:
1. Check the [existing issues](https://github.com/aschmois/humidifier-control-card/issues)
2. Create a new issue with:
   - Your Home Assistant version
   - Card version
   - Browser and version
   - Relevant configuration and error messages

## License

MIT License - see [LICENSE](LICENSE) file for details

## Credits

Built using the [custom-cards/boilerplate-card](https://github.com/custom-cards/boilerplate-card) template.
