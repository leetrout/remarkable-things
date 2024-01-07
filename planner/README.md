# Planner Generator

This is very much a work in progress.

This code generates a PDF planner.

The goal (beyond basic functionality to make me a planner) is to
have it be configurable and easily updated within the code.

## Usage

### Generate a planner

```shell
npm run build
```

## Learnings

Rectangles are "smaller" than circles in the generated PDF so rects
are used for the dots on the grid layout.

~~Due to a limitation in PDFs / the jsPDF library, page linking
requires all pages to be present before links can be generated.
To facilitate this all pages are created and then links are added.~~

I was wrong - this works OK.

## Data structures

### Planner config

(Aspirational)

The planner config describes the structure of the planner
with

### Page set

(Aspirational)

The page set is an array of page properties used for the construction
of the planner PDF.

First the planner config is examined and then the page set is generated
from the given config. The result of this process is an array full of
objects that represent each page in the planner and describe the layout
of the page.

### Layout

(Aspirational)

The layout functions generate a given layout for a page.

The available layouts are:

- `cover`
  - The coversheet, a background image with the year and optional subtitle.
- `cal-year`
  - A calendar of the entire year
- `cal-month`
  - A calendar of the entire month
- `cal-weeks-year`
  - A list of weeks in the year
- `cal-weeks-month`
  - A list of weeks in the month
- `cal-days-month`
  - A list of days in the month
- `daily`
  - A daily organizer / notes layout for each day of the year
- `notes-grid`
  - A grid of dots for generic notes following each day
