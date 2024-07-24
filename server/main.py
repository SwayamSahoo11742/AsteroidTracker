from rendering_functions import PlanetOrbit, SECONDS, update, fig, FuncAnimation, plt
from orbital_functions import SolveOrbit
from datetime import datetime
# These are the arguments taken from hyperphysics.phy-astr.gsu.edu/hbase/solar/soldata2.html
# They are the planet names, max and min distances, and their longitudinal angle
# Also included is Halley's Comet, used to show different scale  and eccentricity
PlanetOrbit("Mercury", 69.8, 46.0)
PlanetOrbit("Venus", 108.9, 107.5)
PlanetOrbit("Earth", 152.1, 147.1)
PlanetOrbit("Mars", 249.1, 206.7)
PlanetOrbit("Halley's Comet", 45900, 88)

def gen_frame():
    frame = 0
    while True:
        yield frame
        frame += SECONDS/365
ani = FuncAnimation(
    fig, update, frames=gen_frame, interval=10, blit=True
)
plt.show()
