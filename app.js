// ---------------------------------------
// Registro e inicio de sesión de prueba
// ---------------------------------------

const formularioRegistro = document.querySelector("#formulario-registro");
const formularioInicio = document.querySelector("#formulario-inicio-sesion");

const mensajeRegistro = document.querySelector("#mensaje-registro");
const mensajeInicio = document.querySelector("#mensaje-inicio");

const formulariosCuenta = document.querySelector("#formularios-cuenta");
const cuentaActiva = document.querySelector("#cuenta-activa");
const saludoUsuario = document.querySelector("#saludo-usuario");
const botonCerrarSesion = document.querySelector("#boton-cerrar-sesion");

const contenidoMascotas = document.querySelector("#contenido-mascotas");
const mensajeRequiereCuenta = document.querySelector(
    "#mensaje-requiere-cuenta"
);

const CLAVE_USUARIOS = "petbalance_usuarios";
const CLAVE_SESION = "petbalance_sesion";


// Lee las cuentas guardadas en este navegador.
function obtenerUsuarios() {
    try {
        const datos = localStorage.getItem(CLAVE_USUARIOS);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error("No se pudieron leer las cuentas:", error);
        return [];
    }
}


// Guarda las cuentas en este navegador.
function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}


// Devuelve el correo de la cuenta activa.
function obtenerSesion() {
    return sessionStorage.getItem(CLAVE_SESION) || "";
}


// Actualiza lo que se ve según haya una sesión iniciada o no.
function actualizarPantallaCuenta() {
    const correoActivo = obtenerSesion();

    if (correoActivo) {
        const usuarios = obtenerUsuarios();

        const usuarioActivo = usuarios.find(
            (usuario) => usuario.correo === correoActivo
        );

        formulariosCuenta.classList.add("oculta");
        cuentaActiva.classList.remove("oculta");
        contenidoMascotas.classList.remove("oculta");
        mensajeRequiereCuenta.classList.add("oculta");

        saludoUsuario.textContent = usuarioActivo
            ? `Hola, ${usuarioActivo.nombre}`
            : "Sesión iniciada";

        mostrarMascotas();
    } else {
        formulariosCuenta.classList.remove("oculta");
        cuentaActiva.classList.add("oculta");
        contenidoMascotas.classList.add("oculta");
        mensajeRequiereCuenta.classList.remove("oculta");
    }
}


// Registro de una cuenta de demostración.
formularioRegistro.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formularioRegistro.checkValidity()) {
        formularioRegistro.reportValidity();
        return;
    }

    const nombre = document
        .querySelector("#registro-nombre")
        .value
        .trim();

    const correo = document
        .querySelector("#registro-correo")
        .value
        .trim()
        .toLowerCase();

    const clave = document.querySelector("#registro-clave").value;
    const usuarios = obtenerUsuarios();

    const correoYaRegistrado = usuarios.some(
        (usuario) => usuario.correo === correo
    );

    if (correoYaRegistrado) {
        mensajeRegistro.textContent =
            "Ese correo ya está registrado. Prueba iniciar sesión.";
        return;
    }

    usuarios.push({
        nombre: nombre,
        correo: correo,
        clave: clave
    });

    guardarUsuarios(usuarios);

    // Inicia sesión automáticamente al registrarse.
    sessionStorage.setItem(CLAVE_SESION, correo);

    formularioRegistro.reset();
    mensajeRegistro.textContent = "Cuenta creada.";

    actualizarPantallaCuenta();
});


// Inicio de sesión con una cuenta creada en este navegador.
formularioInicio.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formularioInicio.checkValidity()) {
        formularioInicio.reportValidity();
        return;
    }

    const correo = document
        .querySelector("#inicio-correo")
        .value
        .trim()
        .toLowerCase();

    const clave = document.querySelector("#inicio-clave").value;
    const usuarios = obtenerUsuarios();

    const usuarioEncontrado = usuarios.find(
        (usuario) => usuario.correo === correo && usuario.clave === clave
    );

    if (!usuarioEncontrado) {
        mensajeInicio.textContent =
            "No encontramos esa cuenta o la contraseña no coincide.";
        return;
    }

    sessionStorage.setItem(CLAVE_SESION, correo);
    formularioInicio.reset();
    mensajeInicio.textContent = "Sesión iniciada.";

    actualizarPantallaCuenta();
});


// Cierre de sesión.
botonCerrarSesion.addEventListener("click", () => {
    sessionStorage.removeItem(CLAVE_SESION);
    actualizarPantallaCuenta();
});


// ------------------------------
// CRUD de mascotas
// ------------------------------

const formularioMascota = document.querySelector("#formulario-mascota");
const listaMascotas = document.querySelector("#lista-mascotas");
const mensajeMascota = document.querySelector("#mensaje-mascota");

const campoMascotaId = document.querySelector("#mascota-id");

const tituloFormularioMascota = document.querySelector(
    "#titulo-formulario-mascota"
);

const botonGuardarMascota = document.querySelector(
    "#boton-guardar-mascota"
);

const botonCancelarEdicion = document.querySelector(
    "#boton-cancelar-edicion"
);

const contadorMascotas = document.querySelector("#contador-mascotas");


// Crea una clave distinta para cada cuenta.
function obtenerClaveMascotas() {
    const correo = obtenerSesion().toLowerCase();
    return `petbalance_mascotas_${correo}`;
}


// Lee las mascotas guardadas de la cuenta activa.
function obtenerMascotas() {
    const clave = obtenerClaveMascotas();

    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error("No se pudieron leer las mascotas:", error);
        return [];
    }
}


// Guarda la lista de mascotas de la cuenta activa.
function guardarMascotas(mascotas) {
    localStorage.setItem(
        obtenerClaveMascotas(),
        JSON.stringify(mascotas)
    );
}


// Crea un identificador para cada mascota.
function crearId() {
    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        return window.crypto.randomUUID();
    }

    return `mascota-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}


// Crea una celda de tabla y añade el dato como texto.
function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto || "—";
    return celda;
}


// READ: muestra los registros de la cuenta activa.
function mostrarMascotas() {
    listaMascotas.replaceChildren();

    const mascotas = obtenerMascotas();

    contadorMascotas.textContent =
        mascotas.length === 1
            ? "1 mascota registrada"
            : `${mascotas.length} mascotas registradas`;

    if (mascotas.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 6;
        celda.textContent = "Todavía no hay mascotas registradas.";

        fila.appendChild(celda);
        listaMascotas.appendChild(fila);
        return;
    }

    mascotas.forEach((mascota) => {
        const fila = document.createElement("tr");

        fila.appendChild(crearCelda(mascota.nombre));
        fila.appendChild(crearCelda(mascota.especie));

        const edad = Number(mascota.edad);
        const textoEdad = edad === 1 ? "1 año" : `${edad} años`;

        fila.appendChild(crearCelda(textoEdad));
        fila.appendChild(crearCelda(mascota.raza));
        fila.appendChild(crearCelda(mascota.indicaciones));

        const celdaAcciones = document.createElement("td");

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.textContent = "Editar";
        botonEditar.className = "boton-tabla";
        botonEditar.dataset.accion = "editar";
        botonEditar.dataset.id = mascota.id;

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.className = "boton-tabla";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.dataset.id = mascota.id;

        celdaAcciones.append(botonEditar, botonEliminar);
        fila.appendChild(celdaAcciones);
        listaMascotas.appendChild(fila);
    });
}


// Deja el formulario listo para registrar una nueva mascota.
function limpiarFormularioMascota() {
    formularioMascota.reset();
    campoMascotaId.value = "";
    tituloFormularioMascota.textContent = "Agregar mascota";
    botonGuardarMascota.textContent = "Agregar mascota";
    botonCancelarEdicion.classList.add("oculta");
}


// CREATE y UPDATE: crea o actualiza el registro.
formularioMascota.addEventListener("submit", (evento) => {
    evento.preventDefault();

    if (!formularioMascota.checkValidity()) {
        formularioMascota.reportValidity();
        return;
    }

    const mascotas = obtenerMascotas();

    const mascotaFormulario = {
        id: campoMascotaId.value || crearId(),

        nombre: document
            .querySelector("#nombre-mascota")
            .value
            .trim(),

        especie: document
            .querySelector("#especie-mascota")
            .value,

        edad: document
            .querySelector("#edad-mascota")
            .value,

        raza: document
            .querySelector("#raza-mascota")
            .value
            .trim(),

        indicaciones: document
            .querySelector("#indicaciones-mascota")
            .value
            .trim()
    };

    if (campoMascotaId.value) {
        const indice = mascotas.findIndex(
            (registro) => registro.id === campoMascotaId.value
        );

        if (indice !== -1) {
            mascotas[indice] = mascotaFormulario;
            mensajeMascota.textContent = "Cambios guardados.";
        }
    } else {
        mascotas.push(mascotaFormulario);
        mensajeMascota.textContent = "Mascota agregada.";
    }

    guardarMascotas(mascotas);
    mostrarMascotas();
    limpiarFormularioMascota();
});


// Detecta si se pulsó Editar o Eliminar.
listaMascotas.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button[data-accion]");

    if (!boton) {
        return;
    }

    const id = boton.dataset.id;
    const accion = boton.dataset.accion;
    const mascotas = obtenerMascotas();

    const mascotaElegida = mascotas.find(
        (mascota) => mascota.id === id
    );

    if (!mascotaElegida) {
        mensajeMascota.textContent = "No se encontró esa mascota.";
        return;
    }

    // UPDATE: carga el registro en el formulario para editarlo.
    if (accion === "editar") {
        campoMascotaId.value = mascotaElegida.id;

        document.querySelector("#nombre-mascota").value =
            mascotaElegida.nombre;

        document.querySelector("#especie-mascota").value =
            mascotaElegida.especie;

        document.querySelector("#edad-mascota").value =
            mascotaElegida.edad;

        document.querySelector("#raza-mascota").value =
            mascotaElegida.raza;

        document.querySelector("#indicaciones-mascota").value =
            mascotaElegida.indicaciones;

        tituloFormularioMascota.textContent = "Editar mascota";
        botonGuardarMascota.textContent = "Guardar cambios";
        botonCancelarEdicion.classList.remove("oculta");

        document.querySelector("#mascotas").scrollIntoView({
            behavior: "smooth"
        });
    }

    // DELETE: borra el registro después de pedir confirmación.
    if (accion === "eliminar") {
        const confirmar = window.confirm(
            `¿Quieres eliminar a ${mascotaElegida.nombre}?`
        );

        if (!confirmar) {
            return;
        }

        const mascotasActualizadas = mascotas.filter(
            (mascota) => mascota.id !== id
        );

        guardarMascotas(mascotasActualizadas);
        mostrarMascotas();
        limpiarFormularioMascota();

        mensajeMascota.textContent = "Mascota eliminada.";
    }
});


// Cancela la edición.
botonCancelarEdicion.addEventListener("click", () => {
    limpiarFormularioMascota();
    mensajeMascota.textContent = "Edición cancelada.";
});


// ------------------------------
// Botones anterior y siguiente
// ------------------------------

const secciones = Array.from(
    document.querySelectorAll("main > section")
);

const botonAnterior = document.querySelector("#boton-anterior");
const botonSiguiente = document.querySelector("#boton-siguiente");


// Lleva a una sección determinada.
function irASeccion(indice) {
    const cantidadSecciones = secciones.length;
    const indiceDestino = (indice + cantidadSecciones) % cantidadSecciones;

    secciones[indiceDestino].scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// Calcula qué sección está más cerca de la parte superior de la página.
function encontrarSeccionActual() {
    const posicionLectura = window.scrollY + 130;
    let indiceActual = 0;

    secciones.forEach((seccion, indice) => {
        if (seccion.offsetTop <= posicionLectura) {
            indiceActual = indice;
        }
    });

    return indiceActual;
}


botonAnterior.addEventListener("click", () => {
    const indiceActual = encontrarSeccionActual();
    irASeccion(indiceActual - 1);
});


botonSiguiente.addEventListener("click", () => {
    const indiceActual = encontrarSeccionActual();
    irASeccion(indiceActual + 1);
});


// Al abrir la página, revisa si hay una sesión guardada.
actualizarPantallaCuenta();

// ---------------------------------------------------------
// Consumo de API (Fetch) y Geolocalización (Evaluación)
// ---------------------------------------------------------

// Fase 1: Selección de Nodos
const btnCargar = document.getElementById('btnCargar');
const btnUbicacion = document.getElementById('btnUbicacion');
const perfilUsuario = document.getElementById('perfilUsuario');
const infoUbicacion = document.getElementById('infoUbicacion');

// Fase 2: Consumo Asíncrono con Fetch API
const obtenerUsuario = async () => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
        
        // Verificación manual obligatoria
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const usuario = await response.json();
        return usuario;
    } catch (error) {
        console.error('Fallo en la petición:', error.message);
        perfilUsuario.innerHTML = '';
        const msjError = document.createElement('p');
        msjError.style.color = 'red';
        msjError.textContent = 'Error al cargar datos del usuario.';
        perfilUsuario.appendChild(msjError);
    }
};

// Fase 3: Renderizado DOM y Persistencia
const mostrarYGuardarUsuario = async () => {
    const usuario = await obtenerUsuario();
    if (!usuario) return;
    
    perfilUsuario.innerHTML = ''; // Limpiar contenido previo
    
    // Uso de createElement() y appendChild() según rúbrica
    const tarjeta = document.createElement('article');
    tarjeta.style.padding = "15px";
    tarjeta.style.border = "1px solid #d8d2c7";
    tarjeta.style.borderRadius = "5px";
    tarjeta.style.backgroundColor = "#fffdf8";
    
    const nombre = document.createElement('h4');
    nombre.style.color = "#17384a";
    nombre.style.marginTop = "0";
    nombre.textContent = `Cuidador asignado: ${usuario.name}`;
    
    const correo = document.createElement('p');
    correo.textContent = `Email de contacto: ${usuario.email}`;
    
    tarjeta.appendChild(nombre);
    tarjeta.appendChild(correo);
    perfilUsuario.appendChild(tarjeta);
    
    // Guardar en Web Storage
    localStorage.setItem('ultimoUsuarioGuardado', usuario.name);
};

if (btnCargar) {
    btnCargar.addEventListener('click', mostrarYGuardarUsuario);
}

// Fase 4: Geolocalización y Manejo de Errores
const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
        infoUbicacion.textContent = 'La geolocalización no es soportada por tu navegador.';
        return;
    }

    infoUbicacion.textContent = 'Buscando tu ubicación...';

    navigator.geolocation.getCurrentPosition(
        (posicion) => {
            const lat = posicion.coords.latitude;
            const lon = posicion.coords.longitude;
            
            infoUbicacion.innerHTML = ''; // Limpiar mensaje de "buscando"
            
            // Renderizado de texto con createElement
            const textoCoordenadas = document.createElement('p');
            textoCoordenadas.innerHTML = `<strong>Ubicación:</strong> Latitud ${lat.toFixed(4)}, Longitud ${lon.toFixed(4)}`;
            infoUbicacion.appendChild(textoCoordenadas);

            // Renderizado del mapa con createElement (para cumplir la rúbrica)
            const mapaIframe = document.createElement('iframe');
            mapaIframe.width = "100%";
            mapaIframe.height = "300";
            mapaIframe.style.border = "1px solid #d8d2c7";
            mapaIframe.style.borderRadius = "8px";
            mapaIframe.style.marginTop = "10px";
            mapaIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.005}%2C${lat - 0.005}%2C${lon + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lon}`;
            
            infoUbicacion.appendChild(mapaIframe);
        },
        (error) => {
            console.error('Error de geolocalización:', error.message);
            infoUbicacion.innerHTML = '';
            
            const msjError = document.createElement('p');
            msjError.style.color = '#e96b4b';
            msjError.textContent = 'No se pudo obtener la ubicación (Permiso denegado o error de red).';
            infoUbicacion.appendChild(msjError);
        }
    );
};

if (btnUbicacion) {
    btnUbicacion.addEventListener('click', obtenerUbicacion);
}