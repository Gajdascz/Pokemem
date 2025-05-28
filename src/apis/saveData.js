import { maxId } from "./pokeAPI";
import { uid } from "../uid";
const data = {
  current: localStorage.getItem("save") ?? null,
  subscribers: [],
  sub: (cb) => data.subscribers.push(cb),
  unsub: (cb) =>
    (data.subscribers = data.subscribers.filter((sub) => sub !== cb)),
  emit: () => data.subscribers.forEach((sub) => sub(data.current)),
  getSaveStr: () => data.current,
  update: (jsonStr) => {
    localStorage.setItem("save", jsonStr);
    data.current = jsonStr;
    data.emit();
  },
  save: (newData) => data.update(JSON.stringify(newData)),
  reset: () => {
    localStorage.clear();
    data.current = null;
    data.emit();
  },
  import: async (file) => {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== "application/json") {
        reject(`Invalid file or file type: ${file.type}`);
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          data.update(e.target.result);
          resolve(e.target.result);
        } catch (error) {
          reject("Failed to process file");
        }
      };
      reader.readAsText(file);
    });
  },
  getSaveObj: () => {
    const save =
      data.current && data.current.length > 0
        ? JSON.parse(data.getSaveStr())
        : null;
    return {
      settings: {
        bgMusic: (save && save.bgMusic) || false,
      },
      session: {
        id: save?.session.id ?? uid(),
        runNumber: save?.session.runNumber ?? 0,
        score: save?.session.score ?? 0,
        round: save?.session.round ?? 0,
        cards: save?.session.cards ?? [],
        cardsImported: save?.session.cards.length >= 10,
        clicked:
          save?.session.clicked && save?.session.clicked.length > 0
            ? new Set(save.session.clicked)
            : new Set(),
      },
      progress: {
        highest: save?.progress.highest ?? { score: 0, round: 0 },
        dexEntries: save?.progress.dexEntries ?? {
          found: 0,
          entries: Array(maxId).fill({ name: null }),
        },
      },
    };
  },
};

const save = (newData) => data.save(newData);
const importSave = (file) => data.import(file);
const clearSave = () => data.reset();
const getSaveStr = () => data.getSaveStr();
const getSaveObj = () => data.getSaveObj();
const sub = (cb) => data.sub(cb);
const unsub = (cb) => data.unsub(cb);

export { save, importSave, clearSave, getSaveStr, getSaveObj, sub, unsub };
