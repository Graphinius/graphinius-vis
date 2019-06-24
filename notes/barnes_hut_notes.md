# Barnes Hut Notes


## Overall phases

1. In each step, bounds on all the positions have to be calculated first.
2. A quadtree is then constructed based on the positions of all the bodies and their bounds.
3. At this point the net force on all the bodies can be calculated by traversing the quadtree for each of the bodies.
4. Finally, we remove the bodies that are too far away and unlikely to affect the simulation anymore.


## Datastructures

### Nodes / Cells

* Reuse nodes
	- member: active: boolean

