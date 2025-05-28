# Pokémem

Pokémem is a Pokémon-themed card game designed to test your memory. The challenge is to click on each displayed card only once per round. Each successful click earns a point, after which the cards are shuffled. When you successfully click on all the cards in a round, you advance to the next round, which introduces a new random card set and adds two new cards to increase the difficulty.

But be careful! Clicking the same card twice in a round will reset your progress, taking your score and round count back to zero. Your high score is based on the highest submitted score, not the highest reached. You'll have to decide when to end your run to secure your score before the game resets to the beginning.


## Learning Outcomes

This project provided hands-on practice with many React principles, including:

- **`useEffect`:** Gained a fundamental understanding of React's useEffect hook. It allows you to synchronize components that rely on data received after the initial rendering process using a setup function, dependency array, and cleanup function. Effects enable components to react to interactions as needed, rather than on every render. [_"Effects let you specify side effects that are cause by rendering itself, rather than by a particular event."_](https://react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events) They allow you to synchronize components that rely on data received after the initial rendering process.
- **React Fundamentals:** Solidified understanding of:
  - **Environment Setup:** Using the Vite toolchain to initialize a React environment and structure files based on components.
  - **JSX and Data Handling:** Using JSX syntax and React keys for efficient rendering and updating.
  - **State Management:** Managing unidirectional data flow and state with hooks and context.
- **Additional Learning:**
  - **Nuanced Data Persistence:** Built a central save data API with a publisher/subscriber pattern to manage local storage data.
    - **Save Interface:** Combines the API's subscriber pattern and React's useEffect hook to subscribe on mount and unsubscribe on unmount.
  - **React Suspense:** Learned about React's lazy loading and Suspense component that allows a fallback to be display until it's children have finished loading.
    - **Loader:** Created a CSS Pokeball animation as a loading indicator.
  - **Asynchronous Programming:** Used async/await syntax with `useEffect` to communicate with PokeAPI.
  - **Advanced CSS:** Created a mock Pokedex using CSS' clip-path polygons and pseudo properties.
  - **React Context:** Centralized state management to reduce prop-drilling and maintain a single source of truth.
  - **Audio:** Edited royalty-free music for looping playback using audacity, implemented using the <audio> element and managed with React state.
  - **Module based CSS:** Utilized module-based CSS stylesheets to prevent naming collisions and simplify styles management.

## Challenges

### Responsive Design

Initially I started out by writing media queries in each component that needed adjustments and used conditional rendering in the App based on viewport dimensions. This approach led to two issues:

1. Managing media queries across multiple components individually became cumbersome.
2. Viewport dimensions alone did not account for dynamically generated content.

To address these issues, I:

- Moved major layout styling rules from individual components to the central App stylesheet.
- Removed media queries and began managing dimensions using React's useState and useEffect hooks to listen for window resize events and execute rendering decisions based on the document's scrollHeight and width rather than the viewport.
- Defined and applied styles to each component in the App using CSS classes based on a dimensions state, adapting via the effect.

### Styling

CSS has been one of the more challenging aspects of web development for me. As someone who strives to follow best practices, I find it difficult to cohesively manage and plan styling across an application's components. I experimented with a new approach by using module-based CSS stylesheets, which allowed for more focused and modular styles. This, however, led to internal debates about what should be managed where, ultimately leading me to shift major layout decisions from individual components to the central component that structures and displays the content.

## Features

- **Responsive Design:** The app fluidly adapts to dynamic content and view dimensions. By adopting a React-centric approach, I used the useState and useEffect hook to track page dimensions and respond to resize events and dynamically adjust the layout based on generated content. This allows the app to adapt not only to viewport dimensions but also to the number of cards displayed.
- **Data Persistence:** Uses JavaScript's Local Storage to retain and manage user progress.
- **Accessibility:** Incorporates a high contrast ratio (7.0+) across the application, relevant aria attributes, and tab-index improvements for navigability.
- **Thematic and Consistent Interface:** Designed around the Pokemon universe and creates an engaging experience.

## Gameplay

### How to Play

- **Objective:** Click each displayed card once per round. Each successful click earns you one point.
- **Progression:** Clicking each card successfully in a round advances you to the next round.
- **Penalty:** Clicking the same card twice in one round resets your current score and round to zero. Your highest score and round are only tracked when you manually end your run.
- **Ending a Run:** Click the "End Run" button to submit your score and round as your highest. Your highest score and round are only tracked when you end your run. Ending your run will reset your current score and round to zero.
- **Round Details:** Each round adds 2 more cards than the previous one. Starting from round 0 with 10 cards, round 1 has 12 cards, round 2 has 14, and so on.
- **Pokedex:** Discover new Pokémon by clicking on cards you've never encountered before. Their names and IDs will be logged in the Pokedex, found in the info panel or sidebar, which displays the number of Pokémon found out of 1025. Click the Pokedex to view your entries.

### Saves

- **Automatic:** Progress is saved in your browser’s local storage when you press the "End Run" button.
- **Manual:** Click the "Save" button in the info panel to manually save and resume later from the exact point you left off.
- **Export:** After saving, an "Export" button will appear below "Save," allowing you to download a .json file for future imports.
- **Import:** Click the "Import" button to select and load a saved file.
- **Reset:** The "Reset" button clears local storage, deleting all saved progress.

## Future

### Improvements

- Improve accessibility, including enhanced keyboard navigation, better ARIA attributes, and auditing.
- Re-evaluate page layout and structure to improve overall design and responsiveness.
- Add comments throughout the codebase for better understanding and maintenance.

### Features

- Store additional details in Pokédex entries to enrich the game's database.
- Introduce badges and achievements to reward players, such as interacting with all Psychic-type Pokémon, reaching a high score of 'X,' and finding Mew and Mewtwo, etc...

## Created With

- [**JavaScript**](https://ecma-international.org/publications-and-standards/standards/): Core language.
- [**HTML5**](https://html.spec.whatwg.org/multipage/): DOM structuring.
- [**CSS3**](https://www.w3.org/Style/CSS/): Design and styling.
- [**React**](https://react.dev/): Front-end JavaScript library.
- [**prop-types**](https://github.com/facebook/prop-types): Library that provides runtime type checking for React props.
- [**Vite**](https://vitejs.dev/): Build tool for faster development and optimized builds (React config).
- [**Prettier**](https://prettier.io/): Code formatter to enforce consistency.
- [**ESLint Config Prettier**](https://github.com/prettier/eslint-config-prettier): Turns off conflicting and/or unnecessary ESLint rules for Prettier.
- [**PokeAPI**](https://pokeapi.co/): Serves Pokemon related data.
- [**Pixabay**](https://pixabay.com/music/video-games-8-bit-background-music-for-arcade-game-come-on-mario-164702/): Royalty free music.
- [**Audacity**](https://www.audacityteam.org/): Audio editor and recorder.
- [**DALL·E 3**](https://openai.com/index/dall-e-3): Image generation.
- [**Git**](https://git-scm.com/): Version control and source code management.
- [**GitHub**](https://github.com/): Remote repository hosting.
- [**CloudFlare Pages**](https://pages.cloudflare.com/): Hosting live application preview.

_Developed as part of [The Odin Project curriculum](https://www.theodinproject.com/lessons/node-path-react-new-memory-card)_

## License

Copyright © 2024 Nolan Gajdascz | GitHub

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

_Pokémon and Pokémon character names are trademarks of Nintendo._
