const formulario = document.getElementById("formulario");
const enviar = document.getElementById("enviar");

enviar.addEventListener("click", function() 
{
    if (formulario.username.value && formulario.password.value) 
    {
        window.location.replace = "https://SoyECS.github.io/body.html";
    } 
    else 
    {
        alert("Completa los campos");
    }
})
