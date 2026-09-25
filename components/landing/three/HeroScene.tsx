"use client";

/* r3f es imperativo por diseño: se muta uniforms, escena y cámara dentro de
   useFrame (fuera del render). La regla del compilador de React no lo modela. */
/* eslint-disable react-hooks/immutability */

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import * as THREE from "three";

/**
 * Hero: un camión avanza por una autopista de noche; al scrollear la cámara sube
 * a cenital y el mundo se "cartografía" (crema + ruta naranja). El camión queda
 * como el punto naranja del mapa. Todo se controla con `progress` (0..1), que se
 * lee por ref: el scroll nunca dispara renders de React.
 */

const NIGHT = new THREE.Color("#0b0a08");
const CREAM = new THREE.Color("#faf7f1");
const ORANGE = new THREE.Color("#e85d2a");

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

/* ── Suelo + ruta (shader propio: sin luces, gratis de dibujar) ───────────── */
const groundVert = /* glsl */ `
  varying vec2 vXZ;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vXZ = w.xz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const groundFrag = /* glsl */ `
  uniform float uMap;
  uniform float uScroll;
  uniform float uTime;
  uniform vec3 uBg;
  varying vec2 vXZ;

  void main() {
    vec2 p = vXZ;
    float ax = abs(p.x);
    float road = 1.0 - smoothstep(3.0, 3.12, ax);
    float dash = step(0.5, fract((p.y - uScroll) / 5.0)) * (1.0 - smoothstep(0.07, 0.11, ax));
    float edge = 1.0 - smoothstep(0.0, 0.1, abs(ax - 2.75));

    vec2 gp = vec2(p.x, p.y - uScroll) / 8.0;
    vec2 gl = abs(fract(gp - 0.5) - 0.5) / fwidth(gp);
    float grid = 1.0 - min(min(gl.x, gl.y), 1.0);

    // Noche: asfalto casi negro, bordes naranja, rayas cálidas y grilla tenue.
    vec3 night = mix(vec3(0.052, 0.048, 0.043), vec3(0.085, 0.08, 0.072), road);
    night += grid * 0.055 * vec3(1.0, 0.55, 0.35);
    night += dash * road * vec3(0.95, 0.88, 0.72) * 0.85;
    night += edge * vec3(0.91, 0.36, 0.16) * 0.7;

    // Mapa: papel crema, calles tinta, cuadrícula de manzanas y ruta naranja.
    vec3 map = mix(vec3(0.98, 0.968, 0.945), vec3(0.16, 0.15, 0.13), road);
    map -= grid * 0.07;
    map = mix(map, vec3(0.16, 0.15, 0.13), (1.0 - smoothstep(1.0, 1.25, abs(mod(p.y - uScroll, 44.0) - 22.0))) * 0.9 * (1.0 - road));
    float route = 1.0 - smoothstep(0.32, 0.5, ax);
    float pulse = 0.5 + 0.5 * sin(p.y * 0.35 - uTime * 4.0);
    map = mix(map, vec3(0.91, 0.36, 0.16), route * (0.85 + 0.15 * pulse));

    vec3 col = mix(night, map, uMap);
    float d = length(p);
    float fade = smoothstep(70.0, 230.0, d);
    col = mix(col, uBg, fade);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Ground({ mapRef, scrollRef }: { mapRef: MutableRefObject<number>; scrollRef: MutableRefObject<number> }) {
  // Material creado a mano: así los uniforms que mutamos son los que dibuja la GPU.
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: groundVert,
        fragmentShader: groundFrag,
        uniforms: {
          uMap: { value: 0 },
          uScroll: { value: 0 },
          uTime: { value: 0 },
          uBg: { value: NIGHT.clone() },
        },
      }),
    [],
  );
  useFrame((_, dt) => {
    const u = material.uniforms;
    u.uMap.value = mapRef.current;
    u.uScroll.value = scrollRef.current;
    u.uTime.value += dt;
    (u.uBg.value as THREE.Color).lerpColors(NIGHT, CREAM, mapRef.current);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[600, 600]} />
    </mesh>
  );
}

/* ── Galpones a los costados: cajas + aristas; en modo mapa se aplastan ───── */
const WARE_N = 46;
const WARE_SPAN = 320;
const EDGE_VERTS = 24; // 12 aristas × 2 vértices por caja

function Warehouses({ mapRef, scrollRef }: { mapRef: MutableRefObject<number>; scrollRef: MutableRefObject<number> }) {
  const fill = useRef<THREE.InstancedMesh>(null);
  const edges = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(
    () => ({ nightFill: new THREE.Color("#14120f"), mapFill: new THREE.Color("#e6dfd0"), mapEdge: new THREE.Color("#1b1a17") }),
    [],
  );

  const items = useMemo(() => {
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: WARE_N }, (_, i) => ({
      x: (i % 2 === 0 ? -1 : 1) * (17 + rnd() * 22),
      z0: (i / WARE_N) * WARE_SPAN,
      w: 5 + rnd() * 8,
      d: 8 + rnd() * 16,
      h: 3 + rnd() * 6,
    }));
  }, []);

  // Vértices de las aristas de una caja unitaria, calculados una sola vez.
  const unit = useMemo(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const eg = new THREE.EdgesGeometry(box);
    const arr = Float32Array.from(eg.getAttribute("position").array as ArrayLike<number>);
    box.dispose();
    eg.dispose();
    return arr;
  }, []);

  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(WARE_N * EDGE_VERTS * 3), 3));
    return g;
  }, []);

  useFrame(() => {
    const m = mapRef.current;
    const flat = lerp(1, 0.015, smooth(0.35, 0.75, m));
    const pos = edgeGeo.getAttribute("position") as THREE.BufferAttribute;
    const out = pos.array as Float32Array;

    for (let i = 0; i < WARE_N; i++) {
      const it = items[i];
      const z = 30 - ((((it.z0 - scrollRef.current) % WARE_SPAN) + WARE_SPAN) % WARE_SPAN);
      const h = Math.max(it.h * flat, 0.02);

      dummy.position.set(it.x, h / 2, z);
      dummy.scale.set(it.w, h, it.d);
      dummy.updateMatrix();
      fill.current?.setMatrixAt(i, dummy.matrix);

      const o = i * EDGE_VERTS * 3;
      for (let v = 0; v < EDGE_VERTS * 3; v += 3) {
        out[o + v] = it.x + unit[v] * it.w;
        out[o + v + 1] = h / 2 + unit[v + 1] * h;
        out[o + v + 2] = z + unit[v + 2] * it.d;
      }
    }
    pos.needsUpdate = true;
    if (fill.current) fill.current.instanceMatrix.needsUpdate = true;

    (fill.current?.material as THREE.MeshBasicMaterial | undefined)?.color.copy(colors.nightFill).lerp(colors.mapFill, m);
    const em = edges.current?.material as THREE.LineBasicMaterial | undefined;
    if (em) {
      em.color.copy(ORANGE).lerp(colors.mapEdge, m);
      em.opacity = lerp(0.55, 0.35, m);
    }
  });

  return (
    <>
      <instancedMesh ref={fill} args={[undefined, undefined, WARE_N]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#14120f" />
      </instancedMesh>
      <lineSegments ref={edges} geometry={edgeGeo} frustumCulled={false}>
        <lineBasicMaterial color="#e85d2a" transparent opacity={0.55} />
      </lineSegments>
    </>
  );
}

/* ── Camión low-poly + punto del mapa ─────────────────────────────────────── */
function Truck({ mapRef }: { mapRef: MutableRefObject<number> }) {
  const truck = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const m = mapRef.current;
    const t = clock.elapsedTime;
    const ts = 1 - smooth(0.42, 0.62, m);
    if (truck.current) {
      truck.current.scale.setScalar(Math.max(ts, 0.0001));
      truck.current.visible = ts > 0.002;
      truck.current.position.y = Math.sin(t * 9) * 0.02;
      truck.current.rotation.z = Math.sin(t * 1.3) * 0.006;
    }
    const ds = smooth(0.5, 0.75, m);
    if (dot.current) {
      dot.current.scale.setScalar(Math.max(ds, 0.0001));
      dot.current.visible = ds > 0.002;
    }
    if (ring.current) {
      const k = (t * 0.9) % 1;
      ring.current.scale.setScalar(1 + k * 5);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - k) * 0.5;
    }
  });

  return (
    <>
      <group ref={truck}>
        {/* caja de carga */}
        <mesh position={[0, 2.1, 1.2]}>
          <boxGeometry args={[2.3, 2.5, 4.6]} />
          <meshStandardMaterial color="#f4f0e6" roughness={0.6} emissive="#3a2a1c" emissiveIntensity={0.25} />
          <Edges color="#e85d2a" threshold={20} />
        </mesh>
        {/* cinta naranja alrededor de la caja */}
        <mesh position={[0, 2.1, 1.2]}>
          <boxGeometry args={[2.36, 2.56, 0.5]} />
          <meshStandardMaterial color="#e85d2a" roughness={0.5} emissive="#e85d2a" emissiveIntensity={0.35} />
        </mesh>
        {/* cabina */}
        <mesh position={[0, 1.45, -2.05]}>
          <boxGeometry args={[2.2, 1.7, 1.5]} />
          <meshStandardMaterial color="#1b1a17" roughness={0.6} />
          <Edges color="#e85d2a" threshold={20} />
        </mesh>
        <mesh position={[0, 1.9, -2.79]}>
          <boxGeometry args={[1.9, 0.7, 0.05]} />
          <meshStandardMaterial color="#2a2925" roughness={0.2} metalness={0.4} />
        </mesh>
        {/* chasis */}
        <mesh position={[0, 0.65, -0.2]}>
          <boxGeometry args={[2.1, 0.35, 6.4]} />
          <meshStandardMaterial color="#0f0e0c" />
        </mesh>
        {/* ruedas */}
        {[
          [-1.15, -1.9],
          [1.15, -1.9],
          [-1.15, 1.6],
          [1.15, 1.6],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.5, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.36, 16]} />
            <meshStandardMaterial color="#0a0908" roughness={0.9} />
          </mesh>
        ))}
        {/* luces traseras (lo que ve la cámara) */}
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} position={[x, 1.0, 3.53]}>
            <boxGeometry args={[0.5, 0.26, 0.06]} />
            <meshBasicMaterial color="#ff5a24" toneMapped={false} />
          </mesh>
        ))}
      </group>

      <group ref={dot} position={[0, 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial color="#e85d2a" toneMapped={false} />
        </mesh>
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
          <ringGeometry args={[1.5, 1.75, 48]} />
          <meshBasicMaterial color="#e85d2a" transparent opacity={0.5} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>
    </>
  );
}

/* ── Luces / polvo que vienen hacia la cámara ─────────────────────────────── */
const PARTICLES = 420;
function Streaks({ mapRef, speedRef }: { mapRef: MutableRefObject<number>; speedRef: MutableRefObject<number> }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(PARTICLES * 3);
    let s = 13;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < PARTICLES; i++) {
      a[i * 3] = (rnd() - 0.5) * 60;
      a[i * 3 + 1] = 0.3 + rnd() * 14;
      a[i * 3 + 2] = -rnd() * 220 + 30;
    }
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, []);

  useFrame((_, dt) => {
    const pos = geo.getAttribute("position") as THREE.BufferAttribute;
    const v = speedRef.current * dt * 1.6;
    for (let i = 0; i < PARTICLES; i++) {
      let z = pos.getZ(i) + v;
      if (z > 30) z -= 250;
      pos.setZ(i, z);
    }
    pos.needsUpdate = true;
    const mat = ref.current?.material as THREE.PointsMaterial | undefined;
    if (mat) mat.opacity = 0.9 * (1 - smooth(0.3, 0.6, mapRef.current));
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#ffb28a" size={0.16} transparent opacity={0.9} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ── Resplandor del horizonte ─────────────────────────────────────────────── */
function Horizon({ mapRef }: { mapRef: MutableRefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  useFrame(() => {
    if (mat.current) mat.current.uniforms.uA.value = 1 - smooth(0.25, 0.5, mapRef.current);
  });
  return (
    <mesh position={[0, 20, -190]}>
      <planeGeometry args={[520, 90]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        uniforms={{ uA: { value: 1 } }}
        vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
        fragmentShader={`
          uniform float uA; varying vec2 vUv;
          void main(){
            float y = 1.0 - abs(vUv.y - 0.32) * 2.6;
            float x = 1.0 - abs(vUv.x - 0.5) * 1.5;
            float a = clamp(y, 0.0, 1.0) * clamp(x, 0.0, 1.0);
            gl_FragColor = vec4(vec3(0.91, 0.36, 0.16), a * a * 0.55 * uA);
          }`}
      />
    </mesh>
  );
}

/* ── Cámara: persecución → cenital → isométrica, según el progreso ─────────── */
function Rig({ progress, mapRef, scrollRef, speedRef }: {
  progress: MutableRefObject<number>;
  mapRef: MutableRefObject<number>;
  scrollRef: MutableRefObject<number>;
  speedRef: MutableRefObject<number>;
}) {
  const { camera, scene, pointer } = useThree();
  const smoothed = useRef(0);
  const look = useMemo(() => new THREE.Vector3(), []);
  const fog = useMemo(() => new THREE.Fog(NIGHT.clone(), 40, 150), []);

  useFrame((state, dt) => {
    smoothed.current += (progress.current - smoothed.current) * Math.min(1, dt * 5);
    const p = smoothed.current;

    const toMap = smooth(0.32, 0.72, p);
    const toIso = smooth(0.74, 1, p);
    mapRef.current = smooth(0.4, 0.7, p);

    // La ruta avanza sola (velocidad base) y más rápido en la persecución.
    speedRef.current = lerp(46, 9, smooth(0.15, 0.6, p));
    scrollRef.current += speedRef.current * dt;

    const t = state.clock.elapsedTime;
    const swayX = Math.sin(t * 0.5) * 0.4 + pointer.x * 1.2;
    const swayY = pointer.y * 0.5;

    // Persecución → cenital
    const chase = { x: swayX, y: 3.4 + swayY, z: 12.5 };
    const top = { x: 0, y: 78, z: 6 };
    const iso = { x: 26, y: 58, z: 34 };
    let x = lerp(chase.x, top.x, toMap);
    let y = lerp(chase.y, top.y, toMap);
    let z = lerp(chase.z, top.z, toMap);
    x = lerp(x, iso.x, toIso);
    y = lerp(y, iso.y, toIso);
    z = lerp(z, iso.z, toIso);
    camera.position.set(x, y, z);

    look.set(lerp(-3.4, 0, toMap), lerp(1.6, 0, toMap), lerp(-9, -2, toMap));
    camera.lookAt(look);
    (camera as THREE.PerspectiveCamera).fov = lerp(52, 38, toMap);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const bg = NIGHT.clone().lerp(CREAM, mapRef.current);
    scene.background = bg;
    fog.color.copy(bg);
    fog.near = lerp(40, 300, mapRef.current);
    fog.far = lerp(150, 700, mapRef.current);
    scene.fog = fog;
  });

  return null;
}

function World({ progress }: { progress: MutableRefObject<number> }) {
  const mapRef = useRef(0);
  const scrollRef = useRef(0);
  const speedRef = useRef(46);
  return (
    <>
      <Rig progress={progress} mapRef={mapRef} scrollRef={scrollRef} speedRef={speedRef} />
      <hemisphereLight args={["#ffd9c2", "#1a1410", 1.1]} />
      <directionalLight position={[6, 12, 10]} intensity={1.6} color="#ffe6d2" />
      <Horizon mapRef={mapRef} />
      <Ground mapRef={mapRef} scrollRef={scrollRef} />
      <Warehouses mapRef={mapRef} scrollRef={scrollRef} />
      <Streaks mapRef={mapRef} speedRef={speedRef} />
      <Truck mapRef={mapRef} />
    </>
  );
}

export default function HeroScene({
  progress,
  active,
}: {
  progress: MutableRefObject<number>;
  active: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 52, near: 0.5, far: 900, position: [0, 3.4, 12.5] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <World progress={progress} />
    </Canvas>
  );
}
