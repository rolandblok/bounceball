//little script using processing.

var uniqueID = (function() {
  var id = 0; // This is the private persistent value
  // The outer function returns a nested function that has access
  // to the persistent value.  It is this nested function we're storing
  // in the variable uniqueID above.
  return function() { return id++; };  // Return and increment
})(); // Invoke the outer function after defining it.


this.stats = new Stats();
document.body.appendChild(this.stats.dom);
stats.showPanel(0)  // 0: fps, 1: ms, 2: mb, 3+: custom
var stats_energy_panel = stats.addPanel( new Stats.Panel( 'energy', '#ff8', '#221' ) );

// var p5_gui = createGui('roland')

var p5gui;
var p5gui_params = {
  speed: 1,  speedMin : 0.1, speedMax: 5, speedStep: 0.05,
  gravity: 1000, gravityMin:0, gravityMax: 10000, gravityStep: 10
}

let disks = []
let paused = false


class MyCircle {
  constructor (x,y,R) {
    this.P = createVector(x,y)
    this.R = R
  }

  overlaps(circle2) {
    let dist = p5.Vector.sub(this.P, circle2.P)

    let sumOfRadii = this.R + circle2.R;
    let distanceSquared = dist.x * dist.x + dist.y * dist.y;

    return distanceSquared  < (sumOfRadii * sumOfRadii)
  }

  // https://ericleong.me/research/circle-circle/#the-closest-point-on-a-line-to-a-point-algorithm
  closestpointtoline(l1, l2) {  
    let P = this.P.copy()
    let A1 = l2.y - l1.y; 
    let B1 = l1.x - l2.x; 
    let C1 = (l2.y - l1.y)*l1.x + (l1.x - l2.x)*l1.y; 
    let C2 = -B1*P.x + A1*P.y; 
    let det = A1*A1 - -B1*B1; 
    let cx = 0; 
    let cy = 0; 
    if (det != 0) { 
      cx = (float)((A1*C1 - B1*C2)/det); 
      cy = (float)((A1*C2 - -B1*C1)/det); 
    } else { 
      cx = P.x; 
      cy = P.y; 
    } 
    return createVector(cx, cy); 
  }

}

class Disk extends MyCircle{
  // speed in pixel/sec
  static instanceFromCircle(c, m, vx,vy) {
    return new Disk(c.P.x, c.P.y, c.R, m, vx,vy )
  }

  constructor(x,y,R, m, vx,vy){
    super(x,y,R)
    this.m = m
    
    this.V = createVector(vx,vy)
    this.id = uniqueID()
    this.color = color(255,255,255)
    this.bounce_color_timer = 255
    
  }
  update(dt_ms) {

    dt_ms *= 0.001*p5gui_params.speed


    if (this.bounce_color_timer < 255) {
      this.bounce_color_timer += dt_ms * 100
    }
    if (this.bounce_color_timer > 255) this.bounce_color_timer = 255


    this.V.y += p5gui_params.gravity * dt_ms

    // hardcoded edge detection
    let P1 = this.P.copy()
    let P2 = p5.Vector.add(P1, p5.Vector.mult(this.V, dt_ms))
    // let P3 = P2.copy()

    // collision the walls
    if ((this.V.x > 0) && (P2.x + this.R > window.innerWidth)) {
      this.V.x = - this.V.x
      P1.x = P2.x
      P2.x = -P2.x +2*(window.innerWidth-this.R)
    } else if ((this.V.x < 0) && (P2.x - this.R <= 0)) {
      this.V.x = - this.V.x
      P1.x = P2.x
      P2.x = -P2.x + 2*this.R
    }
    if ((this.V.y > 0) && (P2.y + this.R > window.innerHeight)) {
      this.V.y = - this.V.y
      P1.y = P2.y
      P2.y = -P1.y +2*(window.innerHeight-this.R)
    } else if ((this.V.y < 0) && (P2.y - this.R <= 0)) {
      this.V.y = - this.V.y
      P1.y = P2.y
      P2.y = -P1.y + 2*this.R
    }

    this.P = P2.copy()


    // https://ericleong.me/research/circle-circle/
    // https://processing.org/examples/circlecollision.html
    disks.forEach(disk => {      // let's check for each other disk if we collide
      if ((disk.id != this.id) && (true)) {   // not with this one
        if (this.overlaps(disk)) { // we overlap
          this.bounce_color_timer = 55
          disk.bounce_color_timer = 55

          this.colide(disk)
          P2 = p5.Vector.add(P1, p5.Vector.mult(this.V, dt_ms))

        }

      }
    })

    this.P = P2.copy()

    
    this.color = color(255,this.bounce_color_timer,this.bounce_color_timer,127)

  }

  energy() {
    return 0.5*this.m*(this.V.x*this.V.x + this.V.y*this.V.y) + this.m * p5gui_params.gravity * (window.innerHeight - this.P.y)
  }


  colide(other) {
    let tana = (other.P.y - this.P.y) / (other.P.x - this.P.x)
    // set to disk 2 reference frame 
    let v =  p5.Vector.sub(this.V, other.V)
    let m1 = this.m
    let m2 = other.m

    let beta = m2*v.x + m2*v.y*tana
    let gamma = 0.5*m2*((1+tana*tana) * (m1 + m2))/m1
    let u2x = beta / gamma
    let u2y = u2x * tana
    let u1x = v.x - m2 * u2x / m1
    let u1y = v.y - m2 * u2y / m1

    let u1 = createVector(u1x, u1y)
    let u2 = createVector(u2x, u2y)

    // move back to reference frame.
    this.V  = p5.Vector.add(u1, other.V)
    other.V = p5.Vector.add(u2, other.V)

  }

  draw() {
    fill(this.color)
    circle(this.P.x, this.P.y, 2*this.R)
    fill(0);
    text(''+this.id,this.P.x, this.P.y )
  }

}

let max_energy = 0
function system_energy() {
  let energy = 0; 
  disks.forEach(disk => {energy+= disk.energy()})
  energy *= 0.0001
  if (energy > max_energy)  max_energy = energy 
  return energy;
}


// =================
// ===setup=========
// =================
function setup() {
  // createCanvas(400,400)
  createCanvas(window.innerWidth, window.innerHeight)
  window.addEventListener("resize", this.resize, false);
  
  window.addEventListener("focus", function(event) { console.log( "window has focus"); paused = false }, false);
  window.addEventListener("blur", function(event) { console.log( "window lost focus");paused = true }, false);
  

  sliderRange(0, 90, 1);
  var p5gui = createGui('roland').setPosition(width - 200, 0);;
  p5gui.addObject(p5gui_params);
  
}

// =================
// ===draw==========
// =================
var last_time_ms = 0
var dirs = [-1, 1]
function draw() {
  this.stats.begin();

  dt_ms = millis() - last_time_ms
  last_time_ms = millis()
  
  
  // update scene
  if (!paused) {
    disks.forEach(disk => {disk.update(dt_ms)});
  }


  // draw scene
  background(255); // Set the background to white



  // draw the mouse
  fill(155);
  circle(mouseX, mouseY, 80);

  disks.forEach(disk => {disk.draw()});

  stats_energy_panel.update( system_energy(), max_energy*2 );
  this.stats.end();

}



// =================
// ===MOUSE n KEYS=======
// =================
function mouseDragged(event) {
  RM = random(20,100)
  let new_circle = new MyCircle(event.x, event.y, RM)
  overlaps = false
  disks.forEach(disk => {
    if (new_circle.overlaps(disk)){overlaps = true} })
  if (!overlaps) {
    let new_disk = Disk.instanceFromCircle(new_circle, RM, random(-1,1)*220, random(-1,1)*220)
    disks.push(new_disk)
  }
} 
function mousePressed(event) {
  mouseDragged(event)
}
function keyPressed(event) {
  console.log("key " + event.key)
  if (event.key === 'p') {
    paused = !paused
  } else if (event.key === 'r') {
    disks = []    
  }

}


function resize() {
  console.log("resize")
  resizeCanvas(window.innerWidth, window.innerHeight)
}