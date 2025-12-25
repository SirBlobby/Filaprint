<script lang="ts">
  import { T } from "@threlte/core";
  import { Float, OrbitControls } from "@threlte/extras";

  interface Props {
    color?: string;
    percentage?: number; // 0 to 100
  }

  let { color = "#ffffff", percentage = 100 }: Props = $props();

  // Filament radius calculation approximation
  // Max radius (full) = 3, Min radius (empty) = 1.2 (hub size)
  // Area is proportional to weight/volume.
  // Area_fil = pi * (R^2 - r_hub^2)
  // Current Area = (percentage/100) * Max_Area
  // R_current = sqrt( Current Area / pi + r_hub^2 )

  const r_hub = 1.2;
  const r_max = 3;
  const area_max = Math.PI * (r_max ** 2 - r_hub ** 2);

  let current_area = $derived((percentage / 100) * area_max);
  let r_current = $derived(Math.sqrt(current_area / Math.PI + r_hub ** 2));
</script>

<Float floatIntensity={0.5} rotationIntensity={0.5} speed={2}>
  <!-- Spool Flanges (Sides) -->
  <T.Group rotation.z={Math.PI / 2}>
    <!-- Left Flange -->
    <T.Mesh position.y={1.1}>
      <T.CylinderGeometry args={[3.2, 3.2, 0.2, 32]} />
      <T.MeshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.1} />
    </T.Mesh>

    <!-- Right Flange -->
    <T.Mesh position.y={-1.1}>
      <T.CylinderGeometry args={[3.2, 3.2, 0.2, 32]} />
      <T.MeshStandardMaterial color="#1e1e1e" roughness={0.5} metalness={0.1} />
    </T.Mesh>

    <!-- Center Hub (Hidden mostly) -->
    <T.Mesh>
      <T.CylinderGeometry args={[1.1, 1.1, 2.2, 32]} />
      <T.MeshStandardMaterial color="#1e1e1e" />
    </T.Mesh>

    <!-- Filament Volume -->
    <T.Mesh>
      <T.CylinderGeometry args={[r_current, r_current, 2, 32]} />
      <T.MeshStandardMaterial {color} roughness={0.3} metalness={0.0} />
    </T.Mesh>
  </T.Group>
</Float>

<OrbitControls autoRotate enableZoom={false} enablePan={false} />
