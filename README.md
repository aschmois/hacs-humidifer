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

1. Download `hacs-humidifier.js` from the [latest release](https://github.com/aschmois/hacs-humdifier/releases)
2. Copy it to `<config>/www/hacs-humidifier.js`
3. Add the resource to your Lovelace configuration:

```yaml
resources:
  - url: /local/hacs-humidifier.js
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
override_timer: timer.upstairs_humidifier_override
override_timer_options: input_select.upstairs_humidifier_timer_options
```

### Full Configuration

```yaml
type: custom:humidifier-control-card
name: Master Bedroom Humidifier
humidity_sensor: sensor.master_thermometer_humidity
target_humidity: input_number.upstairs_humidity
mist_level: number.upstairs_humidifier_mist_level
water_sensor: binary_sensor.upstairs_humidifier_low_water
override_timer: timer.upstairs_humidifier_override
override_timer_options: input_select.upstairs_humidifier_timer_options
```

### Configuration Options

| Name                      | Type   | Required | Default      | Description                                          |
| ------------------------- | ------ | -------- | ------------ | ---------------------------------------------------- |
| `type`                    | string | Yes      | -            | Must be `custom:humidifier-control-card`             |
| `humidity_sensor`         | string | Yes      | -            | Entity ID of the humidity sensor                     |
| `target_humidity`         | string | Yes      | -            | Entity ID of the target humidity input_number        |
| `mist_level`              | string | Yes      | -            | Entity ID of the mist level number entity            |
| `water_sensor`            | string | Yes      | -            | Entity ID of the low water binary_sensor             |
| `override_timer`          | string | Yes      | -            | Entity ID of the override timer (timer domain)       |
| `override_timer_options`  | string | Yes      | -            | Entity ID of the timer options (input_select domain) |
| `name`                    | string | No       | `Humidifier` | Name displayed in the card header                    |

### Required Entities

You need to set up the following entities in your Home Assistant configuration:

1. **Humidity Sensor** (`sensor.*`): Current humidity reading
2. **Target Humidity** (`input_number.*`): Desired humidity level with +/- buttons
3. **Mist Level** (`number.*`): Humidifier mist intensity control
4. **Water Sensor** (`binary_sensor.*`): Low water indicator
5. **Override Timer** (`timer.*`): Actual timer entity that tracks override state
6. **Override Timer Options** (`input_select.*`): Timer duration selector with options like:
   - `Off`
   - `1 minute`
   - `5 minutes`
   - `30 minutes`
   - `1 hour`
   - `24 hours`
   - `Forever`

## How It Works

### Automatic Mode

When the override timer is in `idle` state (set to "Off"), the card displays:

- Current humidity (read-only)
- Target humidity (adjustable with +/- buttons)
- Mist level visualization (read-only icons showing current intensity)
- Override timer dropdown (to enable manual control)

In this mode, your Home Assistant automations control the mist level based on the current and target humidity.

### Manual Override Mode

When the override timer is active (any value other than "Off"):

- Current humidity (read-only)
- Target humidity (adjustable with +/- buttons)
- Mist level control (+/- buttons to manually adjust)
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

This will start a development server on `http://localhost:5000/hacs-humidifier.js`

Add this to your Home Assistant Lovelace resources for testing:

```yaml
resources:
  - url: http://YOUR_DEV_MACHINE_IP:5000/hacs-humidifier.js
    type: module
```

### Build

```bash
npm run build
```

The compiled file will be in `dist/hacs-humidifier.js`

## Screenshots

_Coming soon_

## Support

If you have questions or issues, please:

1. Check the [existing issues](https://github.com/aschmois/hacs-humdifier/issues)
2. Create a new issue with:
   - Your Home Assistant version
   - Card version
   - Browser and version
   - Relevant configuration and error messages

## License

MIT License - see [LICENSE](LICENSE) file for details
