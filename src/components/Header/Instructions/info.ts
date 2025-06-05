export const INFO = {
  title: 'Instructions',
  description:
    'Learn how to play the game, save your progress, and manage your Pokedex.',
  sections: [
    {
      tag: 'Objective',
      text: 'Click each displayed card once per round. Each successful click earns you one point.'
    },
    {
      tag: 'Progression',
      text: 'Clicking each card successfully in a round advances you to the next round.'
    },
    {
      tag: 'Penalty',
      text: 'Clicking the same card twice in one round resets your current score and round to zero. Your highest score and round are only tracked when you manually end your run. See rule below for details.'
    },
    {
      tag: 'Round Details',
      text: 'Each round adds 2 more cards than the previous one. Starting from round 0 with 2 cards, round 1 has 4 cards, round 2 has 6, and so on.'
    },
    {
      tag: 'Pokedex',
      text: "Discover new Pokémon by clicking on cards you've never encountered before. Their names and IDs will be logged in the Pokedex, found in the info panel or sidebar, which displays the number of Pokémon found out of 1025. Click the Pokedex to view your entries."
    },
    {
      tag: 'Saves',
      text: "Progress is automatically saved in your browser's local storage as you play the game. You can also Export and Import your save data to continue your game later by clicking the save icon button in the options menu (cog icon button). Important, if you click the 'Reset' button, your current game state will be lost and you will not be able to recover it. If you want to reset your game and retain your data, please make sure to export your save data first."
    }
  ]
} as const;
