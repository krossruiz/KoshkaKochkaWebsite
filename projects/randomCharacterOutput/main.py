import random
from enum import Enum
    
class Length(Enum):
    SHORT = 5
    MEDIUM = 10
    LONG = 15

Characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']

def generate_random_string(length):
    output = []
    for i in range(length):
        output.append(Characters[random.randint(0, 25)])
    return output
    
outputLength = 10
output = generate_random_string(outputLength)
inputLength = input("Enter the length of the string (short, medium, long): ")
if inputLength.lower() == "short":
    outputLength = Length.SHORT.value   
elif inputLength.lower() == "medium":
    outputLength = Length.MEDIUM.value
elif inputLength.lower() == "long":
    outputLength = Length.LONG.value
print(output)
#['c', 'd', 'n', 'g', 'x', 'u', 'i', 't', 'g', 'o']
#cross does not go cross understand i that go only
#magnetized contact lenses for easy extraction of the lens from the eye
#gravity on contact lense to place it down, funnel for the lens to go into the eye, and a small suction cup to remove the lens from the eye
#ape escape is about slavery
#I have a python program and I want to create a Windows installer that has an option to install it to a custom path. Can you create this installer for me? 
#end of line
# mummbling under breath to communicate truth
# looping to signal an oscillating thought pattern, cycling because you wont know between two or more things because of a lack of information. "Is the ball red or blue?" "It's red." "I don't know." "It's blue." "I can't tell." "It's red?" "Not Sure." "Looping." "Because?" "I only have binary images for a vision system and am colorblind."
#What if I wrote a kernel? Program sentence adaptation for adapting programs, translating one program into a different type of program the same way you translate the characters into acronyms. Bake actual intelligence into the computer by creating <intellisense> a kernel that can adapt programs to different languages and platforms. This kernel would analyze the structure and logic of the original program, then generate equivalent code in the target language while preserving functionality. It could also optimize the code for performance and resource usage, making it more efficient on different systems. </ai>