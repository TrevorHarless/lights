The undo action must be functional for all of the following actions:

1. User adds a new light string to their image
2. User moves a light string on their image. This should only undo their start and end position. For example: the user begins moving a light string using the handles at position (0,0), and ends at position (1,0), if they press the undo button it will undo that move and their light string handle will be back to position (0,0). This does NOT track any position in between. For example, when the user moves from (0,0) to (1,0) they are also hitting a lot of values between 0 and 1 like (.2, 0) --> (.25, 0) --> etc. The undo should only keep track of the start and end position.
3. User deletes a light string
4. User adds a new singular light through tap mode
5. User moves a singular light in tap mode -- the same logic for string lights applies here, the undo should only keep track of the start and end position
6. User removes a singular light
7. User adds a new wreath
8. User resizes a decor item -- the same the same logic for string lights applies here, the undo should only keep track of the start and end size (size in this case instead of position)
9. User repositions a decor item -- the same the same logic for string lights applies here, the undo should only keep track of the start and end position
10. User deletes a decor item
