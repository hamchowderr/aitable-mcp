# AITable Field Colors

This document provides the color values used when modifying the option color value of single-select and multi-select field attributes in AITable.

## Color Reference Table

The following table shows the color relationship corresponding to each color value name.

| Color Name | Value |
|------------|-------|
| deepPurple_0 | Deep Purple (Lightest) |
| indigo_0 | Indigo (Lightest) |
| blue_0 | Blue (Lightest) |
| teal_0 | Teal (Lightest) |
| green_0 | Green (Lightest) |
| yellow_0 | Yellow (Lightest) |
| orange_0 | Orange (Lightest) |
| tangerine_0 | Tangerine (Lightest) |
| pink_0 | Pink (Lightest) |
| red_0 | Red (Lightest) |
| deepPurple_1 | Deep Purple (Light) |
| indigo_1 | Indigo (Light) |
| blue_1 | Blue (Light) |
| teal_1 | Teal (Light) |
| green_1 | Green (Light) |
| yellow_1 | Yellow (Light) |
| orange_1 | Orange (Light) |
| tangerine_1 | Tangerine (Light) |
| pink_1 | Pink (Light) |
| red_1 | Red (Light) |
| deepPurple_2 | Deep Purple (Medium) |
| indigo_2 | Indigo (Medium) |
| blue_2 | Blue (Medium) |
| teal_2 | Teal (Medium) |
| green_2 | Green (Medium) |
| yellow_2 | Yellow (Medium) |
| orange_2 | Orange (Medium) |
| tangerine_2 | Tangerine (Medium) |
| pink_2 | Pink (Medium) |
| red_2 | Red (Medium) |
| deepPurple_3 | Deep Purple (Dark) |
| indigo_3 | Indigo (Dark) |
| blue_3 | Blue (Dark) |
| teal_3 | Teal (Dark) |
| green_3 | Green (Dark) |
| yellow_3 | Yellow (Dark) |
| orange_3 | Orange (Dark) |
| tangerine_3 | Tangerine (Dark) |
| pink_3 | Pink (Dark) |
| red_3 | Red (Dark) |
| deepPurple_4 | Deep Purple (Darkest) |
| indigo_4 | Indigo (Darkest) |
| blue_4 | Blue (Darkest) |
| teal_4 | Teal (Darkest) |
| green_4 | Green (Darkest) |
| yellow_4 | Yellow (Darkest) |
| orange_4 | Orange (Darkest) |
| tangerine_4 | Tangerine (Darkest) |
| pink_4 | Pink (Darkest) |
| red_4 | Red (Darkest) |

## Color Organization

### Color Families

The colors are organized into 10 color families:
1. **Deep Purple** - deepPurple_0 through deepPurple_4
2. **Indigo** - indigo_0 through indigo_4
3. **Blue** - blue_0 through blue_4
4. **Teal** - teal_0 through teal_4
5. **Green** - green_0 through green_4
6. **Yellow** - yellow_0 through yellow_4
7. **Orange** - orange_0 through orange_4
8. **Tangerine** - tangerine_0 through tangerine_4
9. **Pink** - pink_0 through pink_4
10. **Red** - red_0 through red_4

### Shade Levels

Each color family has 5 shade levels (0-4):
- **0** - Lightest shade
- **1** - Light shade
- **2** - Medium shade
- **3** - Dark shade
- **4** - Darkest shade

## Usage

These color values are used when:
- Creating or modifying single-select field options
- Creating or modifying multi-select field options
- Setting option colors via API

### Example Usage

When modifying field properties, specify the color using these exact color names:

```json
{
  "fieldId": "fldXXXXXX",
  "property": {
    "options": [
      {
        "name": "High Priority",
        "color": "red_3"
      },
      {
        "name": "Medium Priority",
        "color": "yellow_2"
      },
      {
        "name": "Low Priority",
        "color": "green_1"
      }
    ]
  }
}
```

## Tips

1. **Consistency**: Use consistent shade levels across similar option types for visual cohesion
2. **Contrast**: Higher shade numbers (3-4) provide better contrast for text visibility
3. **Color Meaning**: Consider conventional color associations (red for urgent, green for success, etc.)
4. **Accessibility**: Ensure sufficient contrast between option colors and text
5. **Total Colors**: 50 total color options (10 families × 5 shades)
