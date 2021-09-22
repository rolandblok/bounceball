//little script using processing.

var uniqueID = (function() {
  var id = 0; // This is the private persistent value
  // The outer function returns a nested function that has access
  // to the persistent value.  It is this nested function we're storing
  // in the variable uniqueID above.
  return function() { return id++; };  // Return and increment
})(); // Invoke the outer function after defining it.


balls = []

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

class Ball extends MyCircle{
  // speed in pixel/sec
  constructor(x,y,R, m, vx,vy){
    super(x,y,R)
    this.m = m
    this.V = createVector(vx,vy)
    this.id = uniqueID()
    this.color = color(255,255,255)
    this.bounce_color_timer = 255
    
  }
  update(dt_ms) {

    if (this.bounce_color_timer < 255) {
      this.bounce_color_timer += dt_ms * 0.1
    }
    if (this.bounce_color_timer > 255) this.bounce_color_timer = 255


    // hardcoded edge detection
    let P1 = this.P.copy()
    let P2 = p5.Vector.add(P1, p5.Vector.mult(this.V,0.001*dt_ms))

    if ((this.V.x > 0) && (P2.x + this.R > window.innerWidth)) {
      this.V.x = - this.V.x
      let A = - (P1.x + this.R)  + window.innerWidth
      let B =   (P2.x + this.R) - window.innerWidth
      P2.x = P1.x + A - B

    } else if ((this.V.x < 0) && (P2.x - this.R <= 0)) {
      this.V.x = - this.V.x
      let A =   (P1.x - this.R)  
      let B =  -(P2.x - this.R) 
      P2.x = P1.x + A - B

    } else if ((this.V.y > 0) && (P2.y + this.R > window.innerHeight)) {
      this.V.y = - this.V.y
      let A = - (P1.y + this.R)  + window.innerHeight
      let B =   (P2.y + this.R) - window.innerHeight
      P2.y = P1.y + A - B
    } else if ((this.V.y < 0) && (P2.y - this.R <= 0)) {
      this.V.y = - this.V.y
      let A =   (P1.y - this.R)  
      let B =  -(P2.y - this.R) 
      P2.y = P1.y + A - B
    } else {
      // https://ericleong.me/research/circle-circle/
      // https://processing.org/examples/circlecollision.html

      if (!this.colided_this_update) {
        balls.forEach(ball => {      // let's check for each other ball if we collide
          if ((ball.id != this.id) && (true)) {   // not with this one
            if (this.overlaps(ball)) { // we overlap
              console.log("overlap " + this.id)
              this.bounce_color_timer = 55
              ball.bounce_color_timer = 55

              this.colide(ball)

              P2 = p5.Vector.add(P1, p5.Vector.mult(this.V,0.001*dt_ms))

            } 
            
          }

        })
      }


    }

    this.P = P2.copy()

    this.color = color(255,this.bounce_color_timer,this.bounce_color_timer)



  }

  energy() {
    return 0.5*this.m*(this.V.x*this.V.x + this.V.y*this.V.y)
  }

  colide(other) {
    let tana = (other.P.y - this.P.y) / (other.P.x - this.P.x)
    // set to ball 2 reference frame 
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

// =================
// ===setup=========
// =================
function setup() {
  // createCanvas(400,400)
  createCanvas(window.innerWidth, window.innerHeight)
  window.addEventListener("resize", this.resize, false);

}

// =================
// ===draw==========
// =================
var last_time_ms = 0
var dirs = [-1, 1]
function draw() {

  dt_ms = millis() - last_time_ms
  last_time_ms = millis()
  // update scene
  let energy = 0; 
  balls.forEach(ball => {energy+= ball.energy()})
  console.log("voor  " + energy);
  energy = 0;

  balls.forEach(ball => {ball.update(dt_ms)});
  balls.forEach(ball => {ball.colided_this_update = false});
  balls.forEach(ball => {energy+= ball.energy()})
  console.log("na    " + energy);

  // draw scene

  background(255); // Set the background to white



  // draw the mouse
  fill(155);
  circle(mouseX, mouseY, 80);

  balls.forEach(ball => {ball.draw()});

}

function mousePressed(event) {
  RM = random(20,50)
  let new_ball = new Ball(mouseX, mouseY, RM, RM, random(-1,1)*100, random(-1,1)*100)
  overlaps = false
  balls.forEach(ball => {
    if (new_ball.overlaps(ball)){overlaps = true} })
  if (!overlaps) balls.push(new_ball)
} 

function resize() {
  console.log("resize")
  resizeCanvas(window.innerWidth, window.innerHeight)
}