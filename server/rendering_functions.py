from math import *
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Circle
from matplotlib.animation import FuncAnimation
from orbital_functions import SolveOrbit, solve_bisection, OrbitLength

SECONDS = 365 * 60 * 60 * 24  # Seconds per year

# MatPlotLib Settings
fig, ax = plt.subplots()
ax.set_aspect("equal")

# Setting the title, axis labels, axis values and introducing a grid underlay
plt.title("Model ")
plt.ylabel("x10^6 km")
plt.xlabel("x10^6 km")
ax.set_xlim(-300, 300)
ax.set_ylim(-300, 300)
plt.grid()

# Creating sun, not to scale
ax.scatter(0, 0, s=200, color="y")
plt.annotate("Sun", xy=(0, -30))


# ------------------------------------------------------------ OBJECT RENDERING FUNCTIONS -----------------------------------------------------------------------------------
# Uses OrbitLength function to get dimensions of the ellipse
# Also uses focal point formula to offset the ellipse so the Sun is at the focal point instead of the center
def PlanetOrbit(Name, M, m):
    w, h = OrbitLength(M, m)
    Xoffset = ((M + m) / 2) - m
    Name = Ellipse(
        xy=((Xoffset), 0), width=w, height=h, angle=0, linewidth=1, fill=False
    )
    ax.add_artist(Name)


# Using SolveOrbit function to get the angle and distance from Sun, which is used to determine the x,y coordinates of the object at time t
def DrawPlanet(name, M, m, t):
    SCALE = 1e9
    print(name)
    theta, r = SolveOrbit(M * SCALE, m * SCALE, t)
    x = -r * cos(theta) / SCALE
    y = r * sin(theta) / SCALE
    planet = Circle((x, y), 8)
    ax.add_artist(planet)
    return planet


# Animation to update the Earth every second
def update(frame):
    planet = DrawPlanet("Earth", 152.1, 147.1, frame / SECONDS * SECONDS)
    planet.set_label("Earth")
    return [planet]
