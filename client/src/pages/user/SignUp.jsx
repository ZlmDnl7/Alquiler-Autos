import { useState } from "react";
import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Zod validation schema
const schema = z.object({
  username: z.string().min(3, { message: "Mínimo 3 caracteres requeridos" }),
  email: z
    .string()
    .min(1, { message: "Email requerido" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Email inválido",
    }),
  password: z.string()
    .min(8, { message: "Mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "Al menos una mayúscula" })
    .regex(/[a-z]/, { message: "Al menos una minúscula" })
    .regex(/\d/, { message: "Al menos un número" })
    .regex(/[^A-Za-z0-9]/, { message: "Al menos un carácter especial" }),
  confirmPassword: z.string()
    .min(1, { message: "Confirma tu contraseña" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Input field component for better reusability
const InputField = ({ type, id, placeholder, register, error }) => (
  <div>
    <input
      type={type}
      id={id}
      className="text-black bg-slate-100 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
      placeholder={placeholder}
      {...register(id)}
    />
    {error && (
      <p className="text-red-500 text-xs pt-1">
        {error.message}
      </p>
    )}
  </div>
);

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });
  
  // Fixed: Properly destructured useState calls
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const onSubmit = async (formData, e) => {
    e?.preventDefault(); // Optional chaining for safety
    setIsLoading(true);
    setError(null); // Clear previous errors
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok || data.success === false) {
        setError(data.message || "Error en el registro");
        return;
      }
      
      // Success case
      navigate("/signin", { 
        state: { message: "Registro exitoso. Inicia sesión con tus credenciales." }
      });
      
    } catch (error) {
      console.error("Registration error:", error);
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-10 max-w-lg mx-auto mt-16 rounded-lg overflow-hidden shadow-2xl">
      <div className="green px-6 py-2 rounded-t-lg flex justify-between items-center">
        <h1 className={`${styles.heading2} text-[28px]`}>Registrarse</h1>
        <Link 
          to="/" 
          className="px-3 font-bold hover:bg-green-300 rounded-md shadow-inner transition-colors"
          aria-label="Cerrar formulario de registro"
        >
          ×
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 pt-10 px-5"
        noValidate
      >
        <InputField
          type="text"
          id="username"
          placeholder="Nombre de Usuario"
          register={register}
          error={errors.username}
        />

        <InputField
          type="email"
          id="email"
          placeholder="Email"
          register={register}
          error={errors.email}
        />

        <InputField
          type="password"
          id="password"
          placeholder="Contraseña"
          register={register}
          error={errors.password}
        />

        <InputField
          type="password"
          id="confirmPassword"
          placeholder="Confirmar Contraseña"
          register={register}
          error={errors.confirmPassword}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className={`${styles.button} disabled:bg-slate-500 text-black disabled:text-white transition-colors`}
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : "Registrarse"}
        </button>

        <div className="flex justify-between items-center">
          <p className="text-xs">
            ¿Ya tienes cuenta?{" "}
            <Link 
              to="/signin" 
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
            >
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default SignUp;