from random import randint


class Cell:
    def __init__(self, value):
        self.value = value
        self.is_open = False
        self.is_flag = False

    def __str__(self):
        if self.is_open:
            if self.value == -1:
                return "*"
            else:
                return str(self.value)
        elif self.is_flag:
            return "F"
        else:
            return "X"

    def open(self):
        self.is_open = True

    def set_value(self, new_value):
        self.value = new_value

    def get_value(self, new_value):
        self.value = new_value

    def change_flag(self):
        self.is_flag = not self.is_flag

    def is_mine(self):
        return self.value == -1


class Field:
    def __init__(self, width, height, mines):
        self.width = width
        self.height = height
        self.mines = mines
        self.minefield = self.create_minefield()
        self.opened = 0

    def create_minefield(self):
        minefield = []
        for i in range(self.height):
            minefield.append([])
            for j in range(self.width):
                minefield[i].append(Cell(0))
        return minefield

    def place_mines(self, i_start, j_start):
        mines = self.mines
        while mines > 0:
            i = randint(0, self.height-1)
            j = randint(0, self.width-1)
            if self.minefield[i][j] == -1:
                continue
            if i_start-2 < i < i_start+2 and j_start-2 < j < j_start+2:
                continue
            self.minefield[i][j].value = -1
            self.change_adjacent_mines(i, j)
            mines -= 1

    def change_adjacent_mines(self, i_cell, j_cell):
        for i in range(i_cell-1, i_cell+2):
            for j in range(j_cell-1, j_cell+2):
                if i < 0 or j < 0 or i >= self.height or j >= self.width:
                    continue
                if self.minefield[i][j].value == -1:
                    continue
                self.minefield[i][j].value += 1

    def __str__(self):
        field = ""
        for i in range(self.height):
            for j in range(self.width):
                field += str(self.minefield[i][j]) + " "
            field += "\n"
        return field

    def open(self, i, j):
        if self.minefield[i][j].is_open:
            return
        self.minefield[i][j].open()
        self.opened += 1
        if self.minefield[i][j].is_mine():
            return
        if self.minefield[i][j].value == 0:
            self.open_adjacent(i, j)

    def open_adjacent(self, i_cell, j_cell):
        for i in range(i_cell-1, i_cell+2):
            for j in range(j_cell-1, j_cell+2):
                if i < 0 or j < 0 or i >= self.height or j >= self.width:
                    continue
                if self.minefield[i][j].is_open:
                    continue
                self.open(i, j)

    def change_flag(self, i, j):
        if self.minefield[i][j].is_open:
            return
        self.minefield[i][j].change_flag()

    def is_mine(self, i, j):
        return self.minefield[i][j].is_mine()

    def is_open(self, i, j):
        return self.minefield[i][j].is_open

    def is_flag(self, i, j):
        return self.minefield[i][j].is_flag

    def is_won(self):
        return self.opened == self.width * self.height - self.mines

    def is_lost(self):
        for i in range(self.height):
            for j in range(self.width):
                if self.minefield[i][j].is_open and self.minefield[i][j].is_mine():
                    return True
        return False


class Game:
    def __init__(self, width, height, mines):
        self.field = Field(width, height, mines)
        self.is_start = False
        self.is_over = False

    def __str__(self):
        return str(self.field)

    def open(self, x, y):
        if not self.is_start:
            self.is_start = True
            self.field.place_mines(x, y)
        elif self.field.is_open(x, y):
            return
        elif self.field.is_flag(x, y):
            return
        elif self.field.is_mine(x, y):
            self.is_over = True
        self.field.open(x, y)
        if self.field.is_won():
            self.is_over = True
            return

    def change_flag(self, x, y):
        if self.field.is_open(x, y):
            return
        self.field.change_flag(x, y)

    def is_over(self):
        return self.is_over

    def is_won(self):
        return self.field.is_won()

    def is_lost(self):
        return self.field.is_lost()

    def is_open(self, x, y):
        return self.field.is_open(x, y)

    def is_flag(self, x, y):
        return self.field.is_flag(x, y)

    def is_mine(self, x, y):
        return self.field.is_mine(x, y)

    def get_value(self, x, y):
        return self.field.minefield[y][x].value


def main():
    game = Game(9, 9, 10)
    while not game.is_over:
        print(game)
        x, y = map(int, input().split())
        game.open(x, y)
        if game.is_won():
            print("You won!")
            print(game)
        if game.is_lost():
            print("You lost!")
            print(game)


if __name__ == "__main__":
    main()
