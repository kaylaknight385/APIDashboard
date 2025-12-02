async function fetchData() {
  try {
    //Assign the HTML elements
    const pokemonName = document.getElementById("pokemonName");
    const pokemonSprite = document.getElementById("pokemonSprite");
    const pokename = document.getElementById("pokename");
    const pokeheight = document.getElementById("pokeheight");
    const pokeweight = document.getElementById("pokeweight");
    const poketype = document.getElementById("poketype");

    //Callback function to fetch data from the API
    await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.value}`)
      .then((res) => res.json())
      .then((data) => {
        //Check the data in the console
        console.log(data);

        //Apply the data to the HTML elements
        pokemonSprite.src = data.sprites.front_default;
        pokename.textContent = `Name: ${
          data.name.charAt(0).toUpperCase() + data.name.slice(1)
        }`;
        pokeheight.textContent = `Height: ${data.height}`;
        pokeweight.textContent = `Weight: ${data.weight}`;    
        poketype.textContent = `Type: ${data.types
          .map(
            (type) =>
              type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1)
          )
          .join(", ")}`;
        pokemonSprite.style.display = "block";
      });

    //Reset the input field
    pokemonName.value = "";

    if (!response.ok) {
      throw new Error("Pokemon not found");
    }
  } catch {
  } finally {
  }
}

// Button click event listener
document.getElementById("fetchButton").addEventListener("click", fetchData);

// Keypress event listener for Enter key
document.getElementById("pokemonName").addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    fetchData();
  }
});
