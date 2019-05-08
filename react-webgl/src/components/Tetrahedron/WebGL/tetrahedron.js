let positions = [];

export default class Tetrahedron {
  constructor(cx, cy, cz, width, height) {
      const radius = (width / 2) / Math.cos(Math.PI / 6);

      // Vertice 1 - Position
      const v1 = {
          x: cx,
          y: cy + height / 2,
          z: cz,
          r: 0, // Red
          g: 0, // Green
          b: 0  // blue
      };

      // Vertice 2 - Position
      const v2 = {
          x: cx,
          y: cy - height / 2,
          z: cz + radius,
          r: 0,
          g: 0,
          b: 0
      };

      // Vertice 3 - Position
      const v3 = {
          x: cx + width / 2,
          y: cy - height / 2,
          z: cz - (Math.sin(Math.PI / 6) * radius),
          r: 0,
          g: 0,
          b: 0
      };

      // Vertice 4 - Position
      const v4 = {
          x: cx - width / 2,
          y: cy - height / 2,
          z: cz - (Math.sin(Math.PI / 6) * radius),
          r: 0,
          g: 0,
          b: 0
      };

      Tetrahedron.addSurface([v1, v2, v3]);
      Tetrahedron.addSurface([v1, v3, v4]);
      Tetrahedron.addSurface([v1, v4, v2]);
      Tetrahedron.addSurface([v3, v2, v4]);
  }

  static addSurface(surface) {
      surface.forEach(element => {
          const value = Object.values(element);
          value.forEach(element => positions.push(element));
      });
  }

  getPositions = () => positions;
}
