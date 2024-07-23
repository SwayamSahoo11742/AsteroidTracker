from rendering_functions import PlanetOrbit, SECONDS, update, fig, FuncAnimation, plt
from orbital_functions import SolveOrbit
# These are the arguments taken from hyperphysics.phy-astr.gsu.edu/hbase/solar/soldata2.html
# They are the planet names, max and min distances, and their longitudinal angle
# Also included is Halley's Comet, used to show different scale  and eccentricity
PlanetOrbit("Mercury", 69.8, 46.0)
PlanetOrbit("Venus", 108.9, 107.5)
PlanetOrbit("Earth", 152.1, 147.1)
PlanetOrbit("Mars", 249.1, 206.7)
PlanetOrbit("Halley's Comet", 45900, 88)

ani = FuncAnimation(
    fig, update, frames=range(0, SECONDS), interval=1000, blit=True
)
plt.show()
