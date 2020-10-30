//checa se é a página inicial
if (document.querySelector("nav").classList.contains("home")) {
    document.querySelector(".home1").classList.add("active");
    document.querySelector("nav").classList.remove("bg-light");
    document.querySelector(".form-inline").remove();
}else if (document.querySelector("nav").classList.contains("sobre")){
    document.querySelector(".sobre1").classList.add("active");
}