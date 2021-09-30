# bouncing disks
http://raw.githack.com/rolandblok/bounceball/master/index.html
 
# Doing some physics
How do you solve this collision of 2 balls : ball 1 and ball 2?

Let's say they have mass : m1 and m2.
We simplify speeds : move to a reference frame of ball 2 : we put ball 2 to standstill, and ball 1 to initial impact speed : v1.

Second simplification : we assume no friction with the floor. Therefore, no rotation of the disks will occur.

Now Newton all the way: action is reaction. The second ball has only a normal force of impact from ball 1. It will move in direction of impact normal. Therefore, we can put an equation for the speed u2 of ball 2 as fraction of the relative positions of the balls:

<img src="https://render.githubusercontent.com/render/math?math=\frac{u_2^y}{u_2^x}  =\frac{\Delta y}{\Delta x} = tan(\alpha)">

We will have Conservation of Momentum:

<img src="https://render.githubusercontent.com/render/math?math=m_1 v_1^x = m_1 u_1^x %2B  m_2 u_2^x">
<img src="https://render.githubusercontent.com/render/math?math=m_1 v_1^y = m_1 u_1^y %2B  m_2 u_2^y">

And also, Conservation of Energy:

<img src="https://render.githubusercontent.com/render/math?math=\frac{1}{2} m_1 \overline{v}_1^2 = \frac{1}{2} m_1 \overline{u_1}^2 %2B \frac{1}{2} m_2 \overline{u}_2^2">

Now you substitute like crazy. This is an excersize for the reader. The result is in the java script!


# links

reference equation markup : https://gist.github.com/a-rodin/fef3f543412d6e1ec5b6cf55bf197d7b
