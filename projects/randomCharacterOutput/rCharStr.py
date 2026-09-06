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