# Humidifier Control Card

A custom Home Assistant Lovelace card for controlling humidifiers with optional override timer and automatic fan speed adjustment.

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

## Features

- **Smart Entity Discovery**: Automatically finds related entities from your humidifier device
- **Clickable Elements**: Click on humidifier name to view device details, click humidity to view sensor details
- **Current Humidity Display**: Large, easy-to-read display of current humidity with unavailable state indicator
- **Target Humidity Control**: Optional slider to adjust target humidity level
- **Fan Speed Visualization**: Visual representation using 5 droplet icons showing current fan speed intensity
- **Override Timer**: Optional dropdown selector for manual override duration
- **Automatic/Manual Modes**:
  - Automatic mode: Fan speed is read-only and controlled by automation (when override timer is idle)
  - Manual mode: Fan speed becomes adjustable manually (when override timer is active or timer not configured)
- **Low Water Alert**: Optional visual warning icon when water level is low
- **Flexible Configuration**: All entities except the main humidifier are optional with smart defaults
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

### Minimal Configuration

The card only requires a humidifier entity. All other entities are optional and will be auto-detected or the card will adapt:

```yaml
type: custom:humidifier-control-card
entity: humidifier.bedroom
```

### Basic Configuration with Manual Control

For full automatic/manual mode support, specify target humidity and override timer entities:

```yaml
type: custom:humidifier-control-card
entity: humidifier.bedroom
target_humidity: input_number.bedroom_humidity_target
override_timer: timer.bedroom_humidifier_override
override_timer_options: input_select.bedroom_timer_options
```

### Full Configuration

```yaml
type: custom:humidifier-control-card
entity: humidifier.bedroom
name: Master Bedroom Humidifier
icon: mdi:air-humidifier-variant
humidity_sensor: sensor.bedroom_humidity
target_humidity: input_number.bedroom_humidity_target
fan_speed: number.bedroom_humidifier_fan_speed
water_sensor: binary_sensor.bedroom_humidifier_water_level
override_timer: timer.bedroom_humidifier_override
override_timer_options: input_select.bedroom_timer_options
```

### Configuration Options

| Name                      | Type   | Required | Default                          | Description                                                           |
| ------------------------- | ------ | -------- | -------------------------------- | --------------------------------------------------------------------- |
| `type`                    | string | Yes      | -                                | Must be `custom:humidifier-control-card`                              |
| `entity`                  | string | Yes      | -                                | Entity ID of the humidifier device                                    |
| `name`                    | string | No       | Auto from entity                 | Name displayed in the card header                                     |
| `icon`                    | string | No       | `mdi:air-humidifier`             | Icon displayed in the card header                                     |
| `humidity_sensor`         | string | No       | Auto-detected                    | Entity ID of the humidity sensor (uses humidifier's attribute first)  |
| `target_humidity`         | string | No       | Auto-detected                    | Entity ID of the target humidity input_number                         |
| `fan_speed`               | string | No       | Auto-detected                    | Entity ID of the fan speed control (number or fan entity)             |
| `water_sensor`            | string | No       | Auto-detected                    | Entity ID of the low water binary_sensor                              |
| `override_timer`          | string | No       | Auto-detected                    | Entity ID of the override timer (timer domain)                        |
| `override_timer_options`  | string | No       | Auto-detected                    | Entity ID of the timer options (input_select domain)                  |

**Note:** Target humidity, override timer, and override timer options work as a group. If any are missing, the card operates in permanent manual mode.

### Entity Auto-Detection

The card attempts to automatically find related entities based on your humidifier device name. For best results:

1. **Humidity Sensor**: The card first checks the humidifier's `current_humidity` attribute. If not available, it searches for sensor entities with matching names containing "humidity"
2. **Target Humidity**: Searches for `input_number` entities with matching names containing "target"
3. **Fan Speed**: First checks for `fan` entities with matching names, then `number` entities containing "mist" or "level"
4. **Water Sensor**: Searches for `binary_sensor` entities with matching names containing "water"
5. **Override Timer**: Searches for `timer` entities with matching names containing "override"
6. **Override Timer Options**: Searches for `input_select` entities with matching names containing "override"

### Example Helper Entities

If auto-detection doesn't work or you prefer explicit control, create these helper entities:

#### Target Humidity (input_number)
```yaml
input_number:
  bedroom_humidity_target:
    name: Bedroom Humidity Target
    min: 30
    max: 70
    step: 1
    unit_of_measurement: "%"
    icon: mdi:water-percent
```

#### Override Timer Options (input_select)
```yaml
input_select:
  bedroom_timer_options:
    name: Bedroom Timer Options
    options:
      - "Off"
      - "1 minute"
      - "5 minutes"
      - "30 minutes"
      - "1 hour"
      - "24 hours"
      - "Forever"
    icon: mdi:timer
```

#### Override Timer (timer)
```yaml
timer:
  bedroom_humidifier_override:
    name: Bedroom Humidifier Override
    icon: mdi:timer-outline
```

## How It Works

### Manual Mode (Default)

When override timer entities are not configured or when the timer is active:

- Current humidity (clickable to view sensor details)
- Humidifier name/icon (clickable to view device details)
- Target humidity (adjustable with +/- buttons, if configured)
- Fan speed control (+/- buttons to manually adjust)
- Override timer dropdown (if configured, to select override duration)

In this mode, you have full manual control of the fan speed.

### Automatic Mode

When override timer entities are configured and the timer is in `idle` state ("Off"):

- Current humidity (clickable to view sensor details)
- Humidifier name/icon (clickable to view device details)
- Target humidity (adjustable with +/- buttons)
- Fan speed visualization (read-only icons showing current intensity)
- Override timer dropdown (to enable manual control)

In this mode, your Home Assistant automations control the fan speed based on the current and target humidity. Select a timer duration to switch to manual mode.

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
