import matplotlib.pyplot as plt
import numpy as np

def main():
    # Constants
    G = 9.81  # m/s^2
    ACCEL_G = 4.5
    TARGET_SPEED_KMH = 100

    # Derived constants
    ACCEL_MS2 = ACCEL_G * G
    TARGET_SPEED_MS = TARGET_SPEED_KMH / 3.6
    TIME_TO_SPEED = TARGET_SPEED_MS / ACCEL_MS2

    print(f"Acceleration: {ACCEL_MS2:.2f} m/s^2")
    print(f"Target Speed: {TARGET_SPEED_MS:.2f} m/s")
    print(f"Time to reach target speed: {TIME_TO_SPEED:.4f} s")

    # Time array (0 to 1.0 seconds, or slightly more to show the crossing)
    # The prompt says "less than a second", so 1.0s is a good window.
    t = np.linspace(0, 1.0, 500)

    # Physics functions
    # a(t) is constant
    a = np.full_like(t, ACCEL_MS2)
    
    # v(t) = a * t
    v = ACCEL_MS2 * t
    
    # x(t) = 0.5 * a * t^2
    x = 0.5 * ACCEL_MS2 * t**2

    # Plotting
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(10, 12), sharex=True)
    
    # Acceleration
    ax1.plot(t, a, color='red', label='Acceleration')
    ax1.set_ylabel('Acceleration ($m/s^2$)')
    ax1.set_title('Drone Physics: 4.5g Acceleration')
    ax1.grid(True)
    ax1.legend()

    # Velocity
    ax2.plot(t, v, color='blue', label='Velocity')
    ax2.axhline(y=TARGET_SPEED_MS, color='green', linestyle='--', label='100 km/h')
    ax2.axvline(x=TIME_TO_SPEED, color='green', linestyle='--')
    ax2.set_ylabel('Velocity (m/s)')
    ax2.grid(True)
    ax2.legend()
    
    # Add text for 100km/h time
    ax2.text(TIME_TO_SPEED + 0.05, TARGET_SPEED_MS, f'Reaches 100km/h\nat {TIME_TO_SPEED:.3f}s', verticalalignment='center')

    # Position
    ax3.plot(t, x, color='purple', label='Position')
    ax3.set_ylabel('Position (m)')
    ax3.set_xlabel('Time (s)')
    ax3.grid(True)
    ax3.legend()

    plt.tight_layout()
    output_file = 'drone_physics_graph.png'
    plt.savefig(output_file)
    print(f"Graph saved to {output_file}")

if __name__ == "__main__":
    main()
