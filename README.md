# reMarkable Things

This repo contains my experiments with my reMarkable tablet
and random bits of information as I discover more about how I
want to use the tablet in my daily workflows.

## Figma

### Layout template

I started tinkering in Figma and created some safe zones so
I would understand where certain UI elements are positioned on the screen.

<a href="https://www.figma.com/community/file/1325119679444457041/remarkable-2-page-with-safe-zones" target="blank">
<img alt="" width="480" src="https://s3-alpha.figma.com/hub/file/4912549230/resized/1200x720/61644077-3515-4225-b57b-c2d266bf57bb-cover.png">
</a>

https://www.figma.com/community/file/1325119679444457041/remarkable-2-page-with-safe-zones

## Planner

The planner directory contains code for generating a yearly
planner for the reMarkable 2. Like many other devs once I got my
hands on the tablet I immediately became curious about how it works
and how I could create my own content for it.

I was curious about working with jsPDF and creating optimized files.
This code currently generates a planner of at least 700 pages with links
for around ~3.5MB while other tools are 10-80MB depending on page count.

See the [Planner README](planner/README.md) for more info.
