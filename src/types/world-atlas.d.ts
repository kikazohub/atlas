declare module "world-atlas/countries-110m.json" {
  const value: {
    type: string;
    objects: {
      countries: {
        type: string;
        geometries: unknown[];
        transform?: unknown;
      };
    };
    arcs: unknown[];
    bbox?: [number, number, number, number];
  };
  export default value;
}