// C program for
// checking if a number is prime
#include <stdio.h>
int main()
{
	int i,v=1;
	int a = 2;
	// iterate through 2 to a/2
	for (i=2;i<=a/2;i++)
	{
		v = a%i;
	// if remainder is zero, the number is not prime
		if(v==0)
			break;
	}
	if (v==0 || a==1)
	printf("%d is not prime number",a);
	else
	printf("%d is prime number",a);
}
// This Code is Contributed by
// Siddharth Verma
