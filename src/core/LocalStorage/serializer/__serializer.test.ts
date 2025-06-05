import { describe, it, expect } from 'vitest';
import { serialize, deserialize } from './serializer';

describe('serializer', () => {
  describe('serialize', () => {
    it('should serialize primitive values', () => {
      expect(serialize(42)).toBe('42');
      expect(serialize('hello')).toBe('"hello"');
      expect(serialize(true)).toBe('true');
      expect(serialize(false)).toBe('false');
      expect(serialize(null)).toBe('null');
      expect(serialize(undefined)).toBe(undefined);
    });

    it('should serialize arrays', () => {
      expect(serialize([1, 2, 3])).toBe('[1,2,3]');
      expect(serialize(['a', 'b', 'c'])).toBe('["a","b","c"]');
      expect(serialize([])).toBe('[]');
    });

    it('should serialize plain objects', () => {
      expect(serialize({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
      expect(serialize({})).toBe('{}');
      expect(serialize({ nested: { value: 42 } })).toBe(
        '{"nested":{"value":42}}'
      );
    });

    it('should serialize Set objects', () => {
      const set = new Set([1, 2, 3]);
      const result = serialize(set);
      expect(result).toBe('{"__type":"Set","values":[1,2,3]}');
    });

    it('should serialize empty Set', () => {
      const set = new Set();
      const result = serialize(set);
      expect(result).toBe('{"__type":"Set","values":[]}');
    });

    it('should serialize Set with mixed types', () => {
      const set = new Set([1, 'hello', true, null]);
      const result = serialize(set);
      expect(result).toBe('{"__type":"Set","values":[1,"hello",true,null]}');
    });

    it('should serialize Map objects', () => {
      const map = new Map([
        ['key1', 'value1'],
        ['key2', 'value2']
      ]);
      const result = serialize(map);
      expect(result).toBe(
        '{"__type":"Map","entries":[["key1","value1"],["key2","value2"]]}'
      );
    });

    it('should serialize empty Map', () => {
      const map = new Map();
      const result = serialize(map);
      expect(result).toBe('{"__type":"Map","entries":[]}');
    });

    it('should serialize Map with mixed key/value types', () => {
      const map = new Map<any, any>([
        [1, 'one'],
        ['two', 2],
        [true, false]
      ]);
      const result = serialize(map);
      expect(result).toBe(
        '{"__type":"Map","entries":[[1,"one"],["two",2],[true,false]]}'
      );
    });

    it('should serialize Date objects', () => {
      const date = { date: new Date('0000-01-01T10:00:00.000Z') };
      const result = serialize(date);
      expect(result).toBe('{"date":"0000-01-01T10:00:00.000Z"}');
    });

    it('should serialize complex nested structures', () => {
      const complex = {
        set: new Set([1, 2, 3]),
        map: new Map([
          ['a', 1],
          ['b', 2]
        ]),
        date: new Date('0000-01-01T10:00:00.000Z'),
        array: [1, 2, { nested: 'value' }],
        primitive: 'hello'
      };
      const result = serialize(complex);
      const expected =
        '{"set":{"__type":"Set","values":[1,2,3]},"map":{"__type":"Map","entries":[["a",1],["b",2]]},"date":"0000-01-01T10:00:00.000Z","array":[1,2,{"nested":"value"}],"primitive":"hello"}';
      expect(result).toBe(expected);
    });

    it('should serialize nested Sets and Maps', () => {
      const nestedSet = new Set([new Set([1, 2]), new Set([3, 4])]);
      const result = serialize(nestedSet);
      expect(result).toBe(
        '{"__type":"Set","values":[{"__type":"Set","values":[1,2]},{"__type":"Set","values":[3,4]}]}'
      );
    });

    it('should serialize Set containing Map and Date', () => {
      const set = new Set([
        new Map([['key', 'value']]),
        new Date('0000-01-01T10:00:00.000Z')
      ]);
      const result = serialize(set);
      expect(result).toBe(
        '{"__type":"Set","values":[{"__type":"Map","entries":[["key","value"]]},"0000-01-01T10:00:00.000Z"]}'
      );
    });
  });

  describe('deserialize', () => {
    it('should return null for falsy data', () => {
      expect(deserialize(null)).toBe(null);
      expect(deserialize(undefined)).toBe(null);
      expect(deserialize('')).toBe(null);
      expect(deserialize(0)).toBe(null);
      expect(deserialize(false)).toBe(null);
    });

    it('should deserialize primitive values from strings', () => {
      expect(deserialize('42')).toBe(42);
      expect(deserialize('"hello"')).toBe('hello');
      expect(deserialize('true')).toBe(true);
      expect(deserialize('false')).toBe(false);
      expect(deserialize('null')).toBe(null);
    });

    it('should deserialize arrays from strings', () => {
      expect(deserialize('[1,2,3]')).toEqual([1, 2, 3]);
      expect(deserialize('["a","b","c"]')).toEqual(['a', 'b', 'c']);
      expect(deserialize('[]')).toEqual([]);
    });

    it('should deserialize plain objects from strings', () => {
      expect(deserialize('{"a":1,"b":2}')).toEqual({ a: 1, b: 2 });
      expect(deserialize('{}')).toEqual({});
    });

    it('should deserialize Set objects from strings', () => {
      const result = deserialize('{"__type":"Set","values":[1,2,3]}');
      expect(result).toBeInstanceOf(Set);
      expect(result).toEqual(new Set([1, 2, 3]));
    });

    it('should deserialize empty Set', () => {
      const result = deserialize('{"__type":"Set","values":[]}');
      expect(result).toBeInstanceOf(Set);
      expect(result).toEqual(new Set());
    });

    it('should deserialize Map objects from strings', () => {
      const result = deserialize(
        '{"__type":"Map","entries":[["key1","value1"],["key2","value2"]]}'
      );
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(
        new Map([
          ['key1', 'value1'],
          ['key2', 'value2']
        ])
      );
    });

    it('should deserialize empty Map', () => {
      const result = deserialize('{"__type":"Map","entries":[]}');
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(new Map());
    });

    it('should deserialize Date objects from strings', () => {
      const result = deserialize('"0000-01-01T10:00:00.000Z"');
      expect(result).toBeInstanceOf(Date);
      expect(result).toEqual(new Date('0000-01-01T10:00:00.000Z'));
    });

    it('should deserialize complex nested structures', () => {
      const serialized =
        '{"set":{"__type":"Set","values":[1,2,3]},"map":{"__type":"Map","entries":[["a",1],["b",2]]},"date":"0000-01-01T10:00:00.000Z","array":[1,2,{"nested":"value"}],"primitive":"hello"}';
      const result = deserialize(serialized);

      expect(result).toEqual({
        set: new Set([1, 2, 3]),
        map: new Map([
          ['a', 1],
          ['b', 2]
        ]),
        date: new Date('0000-01-01T10:00:00.000Z'),
        array: [1, 2, { nested: 'value' }],
        primitive: 'hello'
      });
    });

    it('should deserialize non-string data by serializing first', () => {
      const data = { a: 1, b: new Set([1, 2, 3]) };
      const result = deserialize(data);
      expect(result).toEqual({ a: 1, b: new Set([1, 2, 3]) });
    });

    it('should handle objects with __type that are not special types', () => {
      const data = '{"__type":"UnknownType","value":"test"}';
      const result = deserialize(data);
      expect(result).toEqual({ __type: 'UnknownType', value: 'test' });
    });

    it('should handle objects with __type that is not a string', () => {
      const data = '{"__type":123,"value":"test"}';
      const result = deserialize(data);
      expect(result).toEqual({ __type: 123, value: 'test' });
    });

    it('should handle objects without __type property', () => {
      const data = '{"normalProperty":"value"}';
      const result = deserialize(data);
      expect(result).toEqual({ normalProperty: 'value' });
    });

    it('should handle null values in special type objects', () => {
      const data = '{"__type":"Set","values":null}';
      const result = deserialize(data);
      expect(result).toBeInstanceOf(Set);
      expect(result).toEqual(new Set(null));
    });

    it('should handle nested deserialization', () => {
      const serialized =
        '{"__type":"Set","values":[{"__type":"Map","entries":[["key","0000-01-01T10:00:00.000Z"]]}]}';
      const result = deserialize(serialized);

      expect(result).toBeInstanceOf(Set);
      const setArray = Array.from(result as Set<any>);
      expect(setArray[0]).toBeInstanceOf(Map);
      const mapEntries = Array.from((setArray[0] as Map<any, any>).entries());
      expect(mapEntries[0]![0]).toBe('key');
      expect(mapEntries[0]![1]).toBeInstanceOf(Date);
      expect(mapEntries[0]![1]).toEqual(new Date('0000-01-01T10:00:00.000Z'));
    });
  });

  describe('round-trip serialization/deserialization', () => {
    it('should handle primitive values', () => {
      const values = [42, 'hello', true, false, null];
      values.forEach((value) => {
        const serialized = serialize(value);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(value);
      });
    });

    it('should handle arrays', () => {
      const arrays = [[1, 2, 3], ['a', 'b', 'c'], [true, false, null], []];
      arrays.forEach((array) => {
        const serialized = serialize(array);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(array);
      });
    });

    it('should handle plain objects', () => {
      const objects = [{ a: 1, b: 2 }, { nested: { value: 42 } }, {}];
      objects.forEach((obj) => {
        const serialized = serialize(obj);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(obj);
      });
    });

    it('should handle Set objects', () => {
      const sets = [
        new Set([1, 2, 3]),
        new Set(['a', 'b', 'c']),
        new Set([true, false, null]),
        new Set()
      ];
      sets.forEach((set) => {
        const serialized = serialize(set);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(set);
        expect(deserialized).toBeInstanceOf(Set);
      });
    });

    it('should handle Map objects', () => {
      const maps = [
        new Map([
          ['a', 1],
          ['b', 2]
        ]),
        new Map([
          [1, 'one'],
          [2, 'two']
        ]),
        new Map()
      ];
      maps.forEach((map) => {
        const serialized = serialize(map);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(map);
        expect(deserialized).toBeInstanceOf(Map);
      });
    });

    it('should handle Date objects', () => {
      const dates = [
        new Date('0000-01-01T10:00:00.000Z'),
        new Date('1999-12-31T23:59:59.999Z'),
        new Date()
      ];
      dates.forEach((date) => {
        const serialized = serialize(date);
        const deserialized = deserialize(serialized);
        expect(deserialized).toEqual(date);
        expect(deserialized).toBeInstanceOf(Date);
      });
    });

    it('should handle complex nested structures', () => {
      const complex = {
        primitives: { number: 42, string: 'hello', boolean: true, null: null },
        collections: {
          array: [1, 2, 3],
          set: new Set(['a', 'b', 'c']),
          map: new Map([
            ['key1', 'value1'],
            ['key2', 'value2']
          ])
        },
        dates: {
          created: new Date('0000-01-01T10:00:00.000Z'),
          updated: new Date('0000-01-02T15:30:00.000Z')
        },
        nested: {
          deepSet: new Set([
            new Map([['innerKey', new Date('0000-01-01T10:00:00.000Z')]]),
            { innerObj: 'value' }
          ])
        }
      };

      const serialized = serialize(complex);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(complex);
      expect((deserialized as any).collections.set).toBeInstanceOf(Set);
      expect((deserialized as any).collections.map).toBeInstanceOf(Map);
      expect((deserialized as any).dates.created).toBeInstanceOf(Date);
      expect((deserialized as any).dates.updated).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle circular references gracefully', () => {
      const obj: any = { a: 1 };
      obj.self = obj;

      // JSON.stringify throws on circular references
      expect(() => serialize(obj)).toThrow();
    });

    it('should handle very large Sets', () => {
      const largeSet = new Set();
      for (let i = 0; i < 1000; i++) {
        largeSet.add(i);
      }

      const serialized = serialize(largeSet);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(largeSet);
      expect(deserialized).toBeInstanceOf(Set);
    });

    it('should handle Sets with object values', () => {
      const set = new Set([
        { id: 1, name: 'first' },
        { id: 2, name: 'second' }
      ]);

      const serialized = serialize(set);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(set);
      expect(deserialized).toBeInstanceOf(Set);
    });

    it('should handle Maps with object keys and values', () => {
      const keyObj1 = { id: 1 };
      const keyObj2 = { id: 2 };
      const map = new Map([
        [keyObj1, { value: 'first' }],
        [keyObj2, { value: 'second' }]
      ]);

      const serialized = serialize(map);
      const deserialized = deserialize(serialized);

      expect(deserialized).toEqual(map);
      expect(deserialized).toBeInstanceOf(Map);
    });

    it('should handle invalid JSON in deserialize', () => {
      expect(() => deserialize('invalid json')).toThrow();
    });
  });
});
