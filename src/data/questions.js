// Questions Database grouped by Category, Subcategory, and Difficulty
export const QUESTION_BANK = {
  Maths: {
    Arithmetic: {
      easy: [
        { question: 'What is 5 + 5?', options: ['8', '10', '12', '15'], correctAnswer: '10' },
        { question: 'What is 10 - 4?', options: ['4', '5', '6', '7'], correctAnswer: '6' },
        { question: 'What is 3 x 4?', options: ['12', '14', '7', '9'], correctAnswer: '12' },
        { question: 'What is half of 100?', options: ['25', '40', '50', '60'], correctAnswer: '50' },
        { question: 'What is 15 + 7?', options: ['20', '21', '22', '23'], correctAnswer: '22' },
        { question: 'What is 8 + 8?', options: ['14', '15', '16', '17'], correctAnswer: '16' },
        { question: 'What is 20 - 9?', options: ['10', '11', '12', '13'], correctAnswer: '11' },
        { question: 'What is 10 * 2?', options: ['15', '18', '20', '22'], correctAnswer: '20' },
        { question: 'What is 100 / 4?', options: ['20', '25', '30', '35'], correctAnswer: '25' },
        { question: 'What is 9 + 6?', options: ['13', '14', '15', '16'], correctAnswer: '15' },
        { question: 'What is 12 + 13?', options: ['23', '24', '25', '26'], correctAnswer: '25' },
        { question: 'What is 50 - 25?', options: ['20', '25', '30', '35'], correctAnswer: '25' },
        { question: 'What is 6 x 7?', options: ['40', '41', '42', '43'], correctAnswer: '42' },
        { question: 'What is 81 / 9?', options: ['7', '8', '9', '10'], correctAnswer: '9' },
        { question: 'What is 11 + 22?', options: ['31', '32', '33', '34'], correctAnswer: '33' }
      ],
      medium: [
        { question: 'What is 12 x 12?', options: ['124', '144', '100', '120'], correctAnswer: '144' },
        { question: 'Solve: 50 ÷ 5 + 2', options: ['10', '15', '12', '7'], correctAnswer: '12' },
        { question: 'What is 20% of 150?', options: ['20', '30', '40', '50'], correctAnswer: '30' },
        { question: 'What is 25 * 5?', options: ['100', '125', '150', '175'], correctAnswer: '125' },
        { question: 'What is 1000 / 8?', options: ['100', '125', '150', '200'], correctAnswer: '125' },
        { question: 'What is 15 x 6?', options: ['80', '90', '100', '110'], correctAnswer: '90' },
        { question: 'Solve: (10 + 5) * 2', options: ['20', '25', '30', '35'], correctAnswer: '30' },
        { question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], correctAnswer: '30' },
        { question: 'What is 144 / 12?', options: ['10', '11', '12', '13'], correctAnswer: '12' },
        { question: 'Solve: 4^3', options: ['16', '64', '32', '128'], correctAnswer: '64' }
      ],
      hard: [
        { question: 'What is 14 x 13?', options: ['172', '182', '192', '162'], correctAnswer: '182' },
        { question: 'What is sqrt(625)?', options: ['23', '24', '25', '26'], correctAnswer: '25' },
        { question: 'Solve: 2^6', options: ['32', '64', '128', '256'], correctAnswer: '64' },
        { question: 'What is 17 x 18?', options: ['306', '296', '316', '286'], correctAnswer: '306' },
        { question: 'What is 15% of 1500?', options: ['215', '225', '235', '245'], correctAnswer: '225' },
        { question: 'Solve: (25 * 4) + (50 / 2)', options: ['120', '125', '130', '135'], correctAnswer: '125' },
        { question: 'What is 999 / 9?', options: ['101', '111', '121', '131'], correctAnswer: '111' }
      ]
    },
    Algebra: {
      easy: [
        { question: 'If x + 5 = 10, what is x?', options: ['2', '5', '10', '15'], correctAnswer: '5' },
        { question: 'If 2x = 12, what is x?', options: ['4', '5', '6', '7'], correctAnswer: '6' },
        { question: 'If x - 3 = 7, what is x?', options: ['8', '9', '10', '11'], correctAnswer: '10' },
        { question: 'If 3x = 15, what is x?', options: ['3', '4', '5', '6'], correctAnswer: '5' }
      ],
      medium: [
        { question: 'If x = 3, what is 2x + 1?', options: ['6', '7', '8', '9'], correctAnswer: '7' },
        { question: 'Solve for y: 2y = 10', options: ['2', '4', '5', '8'], correctAnswer: '5' },
        { question: 'If 2x + 4 = 10, what is x?', options: ['2', '3', '4', '5'], correctAnswer: '3' },
        { question: 'If x/2 = 8, what is x?', options: ['12', '14', '16', '18'], correctAnswer: '16' }
      ],
      hard: [
        { question: 'Solve for x: 3x - 7 = 14', options: ['3', '5', '7', '9'], correctAnswer: '7' },
        { question: 'Solve for x: x^2 = 144', options: ['10', '11', '12', '13'], correctAnswer: '12' },
        { question: 'If 5x + 5 = 30, what is x?', options: ['4', '5', '6', '7'], correctAnswer: '5' }
      ]
    }
  },
  Science: {
    Space: {
      easy: [
        { question: 'What planet do we live on?', options: ['Mars', 'Venus', 'Earth', 'Jupiter'], correctAnswer: 'Earth' },
        { question: 'What is the center of our solar system?', options: ['Earth', 'Moon', 'Sun', 'Mars'], correctAnswer: 'Sun' },
        { question: 'Which planet is known as the Morning Star?', options: ['Mars', 'Venus', 'Jupiter', 'Mercury'], correctAnswer: 'Venus' },
        { question: 'What is the closest planet to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correctAnswer: 'Mercury' },
        { question: 'How many planets are in our solar system?', options: ['7', '8', '9', '10'], correctAnswer: '8' }
      ],
      medium: [
        { question: 'Which planet is known as the Red Planet?', options: ['Jupiter', 'Venus', 'Mars', 'Saturn'], correctAnswer: 'Mars' },
        { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'], correctAnswer: 'Jupiter' },
        { question: 'Which planet has the most prominent rings?', options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'], correctAnswer: 'Saturn' },
        { question: 'What is the name of Earth\'s natural satellite?', options: ['Sun', 'Moon', 'Mars', 'Venus'], correctAnswer: 'Moon' }
      ],
      hard: [
        { question: 'What is the speed of light approx in km/s?', options: ['300,000', '150,000', '1,000,000', '500,000'], correctAnswer: '300,000' },
        { question: 'Which galaxy is home to the Solar System?', options: ['Andromeda', 'Milky Way', 'Sombrero', 'Messier 81'], correctAnswer: 'Milky Way' },
        { question: 'What is the hottest planet in our solar system?', options: ['Mercury', 'Venus', 'Mars', 'Jupiter'], correctAnswer: 'Venus' }
      ]
    },
    Biology: {
      easy: [
        { question: 'What do humans breathe to survive?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Helium'], correctAnswer: 'Oxygen' },
        { question: 'How many legs does a spider have?', options: ['6', '8', '10', '12'], correctAnswer: '8' },
        { question: 'Which organ pumps blood throughout the body?', options: ['Lungs', 'Brain', 'Heart', 'Stomach'], correctAnswer: 'Heart' }
      ],
      medium: [
        { question: 'How many bones are in the adult human body?', options: ['206', '210', '195', '220'], correctAnswer: '206' },
        { question: 'What is the largest organ in the human body?', options: ['Liver', 'Brain', 'Skin', 'Heart'], correctAnswer: 'Skin' },
        { question: 'What do plants need for photosynthesis?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], correctAnswer: 'Carbon Dioxide' }
      ],
      hard: [
        { question: 'What part of the cell is known as the powerhouse?', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Cytoplasm'], correctAnswer: 'Mitochondria' },
        { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Organ'], correctAnswer: 'Cell' },
        { question: 'How many chambers does the human heart have?', options: ['2', '3', '4', '5'], correctAnswer: '4' }
      ]
    }
  },
  Programming: {
    Web: {
      easy: [
        { question: 'Which programming language runs natively in the browser?', options: ['Python', 'JavaScript', 'C++', 'Java'], correctAnswer: 'JavaScript' },
        { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Logic', 'Home Tool Markup'], correctAnswer: 'Hyper Text Markup Language' },
        { question: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Colorful Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets'], correctAnswer: 'Cascading Style Sheets' }
      ],
      medium: [
        { question: 'Which React hook is used for managing component state?', options: ['useEffect', 'useState', 'useRef', 'useContext'], correctAnswer: 'useState' },
        { question: 'What protocol is used to transfer web pages securely?', options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'], correctAnswer: 'HTTPS' },
        { question: 'What does API stand for?', options: ['Application Programming Interface', 'Applied Program Interaction', 'Advanced Program Integration', 'Automated Program Interface'], correctAnswer: 'Application Programming Interface' }
      ],
      hard: [
        { question: 'What is a "closure" in JavaScript?', options: ['A closed window', 'Function bundled with lexical environment', 'Ending a program loop', 'A private class'], correctAnswer: 'Function bundled with lexical environment' },
        { question: 'What is the "this" keyword in JavaScript?', options: ['Current function', 'Current object context', 'Global object only', 'None of the above'], correctAnswer: 'Current object context' },
        { question: 'What is the Virtual DOM in React?', options: ['A physical copy of the DOM', 'A lightweight representation of the real DOM', 'A way to browse the web', 'A browser plugin'], correctAnswer: 'A lightweight representation of the real DOM' }
      ]
    },
    Python: {
      easy: [
        { question: 'Is Python an interpreted or compiled language?', options: ['Compiled', 'Interpreted', 'Both', 'Neither'], correctAnswer: 'Interpreted' },
        { question: 'Which keyword is used to define a function in Python?', options: ['func', 'define', 'def', 'function'], correctAnswer: 'def' }
      ],
      medium: [
        { question: 'What is the extension of a Python file?', options: ['.py', '.pt', '.pyt', '.python'], correctAnswer: '.py' },
        { question: 'How do you insert a comment in Python?', options: ['//', '/*', '#', '--'], correctAnswer: '#' }
      ],
      hard: [
        { question: 'Which of the following is an immutable data type in Python?', options: ['List', 'Dictionary', 'Set', 'Tuple'], correctAnswer: 'Tuple' },
        { question: 'What is a "decorator" in Python?', options: ['A way to style code', 'A function that modifies another function', 'A class attribute', 'A type of list'], correctAnswer: 'A function that modifies another function' }
      ]
    }
  },
  Anime: {
    Shonen: {
      easy: [
        { question: 'What is the name of the protagonist in Naruto?', options: ['Sasuke', 'Naruto', 'Kakashi', 'Itachi'], correctAnswer: 'Naruto' },
        { question: 'Who is the main character in One Piece?', options: ['Zoro', 'Sanji', 'Luffy', 'Nami'], correctAnswer: 'Luffy' },
        { question: 'What is Goku\'s signature move?', options: ['Rasengan', 'Kamehameha', 'Chidori', 'Getsuga Tensho'], correctAnswer: 'Kamehameha' }
      ],
      medium: [
        { question: 'What is the name of the school in My Hero Academia?', options: ['U.A. High', 'Ninja Academy', 'Jujutsu High', 'Soul Society'], correctAnswer: 'U.A. High' },
        { question: 'Who is the creator of Dragon Ball?', options: ['Masashi Kishimoto', 'Eiichiro Oda', 'Akira Toriyama', 'Tite Kubo'], correctAnswer: 'Akira Toriyama' },
        { question: 'Which anime features "Dragon Balls"?', options: ['One Piece', 'Bleach', 'Dragon Ball Z', 'Hunter x Hunter'], correctAnswer: 'Dragon Ball Z' }
      ],
      hard: [
        { question: 'What is the name of Ichigo\'s Zanpakuto in Bleach?', options: ['Zangetsu', 'Senbonzakura', 'Muramasa', 'Sode no Shirayuki'], correctAnswer: 'Zangetsu' },
        { question: 'Which anime features the "Death Note"?', options: ['Death Note', 'Code Geass', 'Monster', 'Tokyo Ghoul'], correctAnswer: 'Death Note' },
        { question: 'What is the name of Goku\'s father?', options: ['Bardock', 'Raditz', 'King Vegeta', 'Paragus'], correctAnswer: 'Bardock' }
      ]
    }
  },
  Movies: {
    Hollywood: {
      easy: [
        { question: 'Who directed "Inception"?', options: ['James Cameron', 'Christopher Nolan', 'Steven Spielberg', 'Peter Jackson'], correctAnswer: 'Christopher Nolan' }
      ]
    }
  },
  Sports: {
    Football: {
      easy: [
        { question: 'Which country won the 2022 World Cup?', options: ['France', 'Brazil', 'Argentina', 'Germany'], correctAnswer: 'Argentina' }
      ]
    },
    Cricket: {
      easy: [
        { question: 'How many players are in a cricket team?', options: ['9', '10', '11', '12'], correctAnswer: '11' },
        { question: 'Who won the 2011 Cricket World Cup?', options: ['Australia', 'India', 'Sri Lanka', 'England'], correctAnswer: 'India' }
      ]
    },
    Basketball: {
      easy: [
        { question: 'How many points is a regular shot inside the arc worth?', options: ['1', '2', '3', '4'], correctAnswer: '2' },
        { question: 'Which team did Michael Jordan famously play for?', options: ['Lakers', 'Bulls', 'Celtics', 'Heat'], correctAnswer: 'Bulls' }
      ]
    },
    Tennis: {
      easy: [
        { question: 'Which Grand Slam tournament is played on clay?', options: ['Wimbledon', 'US Open', 'French Open', 'Australian Open'], correctAnswer: 'French Open' }
      ]
    },
    Olympics: {
      easy: [
        { question: 'How often are the Summer Olympics held?', options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'], correctAnswer: 'Every 4 years' }
      ]
    }
  },
  History: {
    Ancient: {
      easy: [
        { question: 'Who was the first President of the USA?', options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington', 'John Adams'], correctAnswer: 'George Washington' }
      ]
    }
  },
  Geography: {
    Continents: {
      easy: [
        { question: 'What is the smallest continent?', options: ['Europe', 'Asia', 'Australia', 'Africa'], correctAnswer: 'Australia' }
      ]
    }
  },
  Music: {
    Rock: {
      easy: [
        { question: 'Who sang "Purple Haze"?', options: ['Jimi Hendrix', 'Eric Clapton', 'Kurt Cobain', 'Slash'], correctAnswer: 'Jimi Hendrix' }
      ]
    }
  }
};

