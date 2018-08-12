# Roll20 Turn Toggle Userscript

When added to Roll20 using [TamperMonkey](https://tampermonkey.net/) or
[GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/), this script adds
the ability to mark initiative entries by clicking on them. When marked, the
initiative entry will be highlighted blue (indicating an ally) or red (indicating
an enemy). Two sets of buttons to mark and clear all initiative entries for each
team are also added. These marks will persist between closing and reopening an
instance of Roll20.

This script was written for my Dungeons & Dragons group. Our GM switched one
of his games to a team-based turn order instead of initiative to see if it would
facilitate more team planning and faster rounds. This plugin allows our GM to track
who has moved and who hasn't with less micromanaging of the initiative order.

To make a token in the initiative an ally, set their initiative to a non-zero number.
To make a token in the initiative an enemy, set their initiative to zero.

## Current limitations

1) Initiative entries are identified by token ID, so marks won't be carried between boards.
If the same token is in the initiative multiple times, marking it will mark all other instances.

2) Currently, the only way to distinguish enemies is by checking to see if their
initiative is 0. This is quite limiting, but doesn't matter much if the initiative values aren't
actually being used. This is actually useful for sorting initiative into player and enemy groups,
however.

3) Marks are only stored and managed by each individual user (i.e. the GM can not unhighlight
a turn to communicate to the players that it has occurred).
