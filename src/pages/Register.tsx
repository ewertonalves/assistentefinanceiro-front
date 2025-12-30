import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { registroUsuarioSchema } from '@/utils/validators';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import type { RegistroUsuarioDTO } from '@/types/auth.types';
import { Role } from '@/types/auth.types';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroUsuarioDTO>({
    resolver: yupResolver(registroUsuarioSchema) as any,
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      role: Role.USER,
    },
  });

  const roleOptions = [
    { value: 'USER', label: 'Usuário' },
    { value: 'ADMIN', label: 'Administrador' },
  ];

  const onSubmit = async (data: RegistroUsuarioDTO) => {
    try {
      await registerUser(data);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.mensagem || 'Erro ao realizar cadastro';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-6xl text-blue-600 font-bold text-center mb-6">
          Lumis
        </h1>
        <h2 className="text-xl text-blue-600 font-semibold text-center mb-6">
          Criar Conta
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome"
            type="text"
            {...register('nome', { required: false })}
            error={errors.nome?.message}
            placeholder="Seu nome completo"
          />

          <Input
            label="Email"
            type="email"
            {...register('email', { required: false })}
            error={errors.email?.message}
            placeholder="e-mail"
          />

          <Input
            label="Senha"
            type="password"
            {...register('senha', { required: false })}
            error={errors.senha?.message}
            placeholder="senha"
          />

          <Select
            label="Tipo de Usuário"
            options={roleOptions}
            {...register('role')}
            error={errors.role?.message}
          />

          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
          >
            Cadastrar
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem conta?{' '}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

