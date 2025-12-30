import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { loginSchema } from "@/utils/validators";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import type { JwtRequest } from "@/types/auth.types";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JwtRequest>({
    resolver: yupResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = async (data: JwtRequest) => {
    try {
      await login(data);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMsg = error.response?.data?.mensagem || "Erro ao fazer login";
      toast.error(errorMsg);
    }
  };

  return (
    <>
      <div className="relative">
        <div className="container-img">
          <img src="/bg-img.jpg" alt="Login" />
        </div>
        <div className="w-screen flex items-center justify-center px-4 absolute top-0 mt-24">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-6xl text-blue-600 font-bold text-center mb-6 fontcolorprimary">
              Lumis
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...register("email", { required: false })}
                error={errors.email?.message}
                placeholder="e-mail"
                className="input-login focus:outline-none focus:ring-0"
              />

              <Input
                label="Senha"
                type="password"
                {...register("senha", { required: false })}
                error={errors.senha?.message}
                placeholder="senha"
                className="input-login focus:outline-none focus:ring-0"
              />

              <Button
                type="submit"
                fullWidth
                isLoading={isSubmitting}
                className="button-login transform transition-transform duration-300 ease-in-out"
              >
                Entrar
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              Não tem conta?{" "}
              <Link
                to="/register"
                className="fontcolorprimary font-medium"
              >
                Cadastre-se
              </Link>
            </p>

            <div className="info-login mt-6 p-4 rounded-lg">
              <p className="text-sm text-800 font-semibold mb-2">
                Usuário de teste:
              </p>
              <p className="text-xs">Email: admin@teste.com</p>
              <p className="text-xs">Senha: 123</p>
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
          .container-img {
              filter: brightness(0.6);
          }
          .container-img img {
            width:100vw;
            height: 100vh;
          }

          .button-login {
            background-color: var(--color-primary);
            transition: var(--trasitions-buttons);
          }

          .button-login:hover {
            background: var(--color-secondary);
            box-shadow: var(--box-shadow-button);
          }
          
          .input-login:focus {
            border-color: var(--color-primary);
          }

          .info-login {
            background: var(--color-primary-opacity);
          }
        `}
      </style>
    </>
  );
};
