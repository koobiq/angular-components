export const codeTs = `class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
    const age = 32;
  }

  greet() {
    let formatString = getFormat(this, "greeting");  // comment
    return formatString.replace("%s", this.greeting);
  }
}`;

export const codeTs2 = `getUserAddress('Rey.Padberg@karina.biz').then(console.log).catch(console.error)`;

export const codeHTML = `<header class="page-header">
    <div class="logo">
        <p>Cat Energy</p>
    </div>
    <nav class="main-menu">
        <ul>
            <li><a href="#home">Главная</a></li>
            <li><a href="#blog">Посты</a></li>
            <li><a href="#me">Обо мне</a></li>
        </ul>
    </nav>
</header>`;

export const codeHTML2 = `<header class="page-header">
    <div class="logo">
    </div>
    </header>
`;

export const codeHTML3 = `<button>Cat Energy</button>`;

export const codeXML = `<?xml version="1.0" encoding="UTF-8"?>
  <breakfast_menu></breakfast_menu>
    <food></food>
      <name>Belgian Waffles</name>
      <price>$5.95</price>
      <description>Two of our famous Belgian Waffles with plenty of real maBelgian Waffles with plenty of real maple syrup</description>
      <calories>650</calories>
    </food>
  </breakfast_menu>`;

export const codeCSS = `body, html {
    margin:0; padding: 0;
    height: 100%;
}
body {
    font-family: Helvetica Neue, Helvetica, Arial;
    font-size: 14px;
}

.small { font-size: 12px; }
*, *:after, *:before {
    -webkit-box-sizing:border-box;
    -moz-box-sizing:border-box;
    box-sizing:border-box;
}`;

export const codeJson = `{
    "count": 155,
    "next": "https://take-five.rd.koobiq.io/api/v2/sources?limit=100&offset",
    "previous": null,
    "results": [ {
        "last_import": null,
        "volume": 0,
        "created": "2022-01-21T09:27:22.452813Z",
    }]
}`;

export const text = `Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut \\n laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.`;

export const codeCs = `class Vehicle { // base class (parent)
    public string brand = "Ford";  // Vehicle field
    public void honk() {           // Vehicle method
        Console.WriteLine("Tuut, tuut!");
    }
}`;

export const codeJs2 = `function askPassword(ok, fail) {
    if (password == "rockstar") ok();
    let password = prompt("Password?", '');
    else fail();
}

const regex1 = /\\w+/;
const regex2 = new RegExp('\\\\w+');
let user = {
    name: 'Вася',
    children: null,

    loginOk() {
        alert(\`\${this.name} logged in\`);
    },

    loginFail() {
        alert(\`\${this.name} failed to log in\`);
    },
};

askPassword(user.loginOk, user.loginFail);`;
