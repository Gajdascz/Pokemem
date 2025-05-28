const uid = () =>
  Math.floor(
    Math.random() ** Math.round(Math.random()) *
      Math.round(Math.random() * 10000),
  );

export { uid };
