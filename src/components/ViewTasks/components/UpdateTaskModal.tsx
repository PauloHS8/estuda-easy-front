"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setHours, setMinutes, format, parseISO } from "date-fns";
import { taskSchema, TaskFormData } from "../schemas/taskSchema";
import TaskService from "@/services/task/TaskService";
import { TaskResponse } from "../../../types/task";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  task: TaskResponse;
  onSuccess: () => void;
  onOpenChange: (open: boolean) => void;
}

export function UpdateTaskModal({ open, task, onSuccess, onOpenChange }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: task.name,
      description: task.description || "",
      startTime: task.startDate ? format(parseISO(task.startDate), "HH:mm") : "09:00",
      endTime: task.endDate ? format(parseISO(task.endDate), "HH:mm") : "10:00",
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (!task.startDate) {
        throw new Error("Data de início não encontrada.");
      }

      const baseDate = parseISO(task.startDate);
      const [startH, startM] = data.startTime.split(":").map(Number);
      const [endH, endM] = data.endTime.split(":").map(Number);

      const startDate = setMinutes(setHours(baseDate, startH), startM).toISOString();
      const endDate = setMinutes(setHours(baseDate, endH), endM).toISOString();

      await TaskService.update(task.id, {
        name: data.name,
        description: data.description,
        startDate,
        endDate,
        status: task.status,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast.error("Não foi possível atualizar a tarefa.");
    }
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await TaskService.delete(task.id);
        onSuccess();
        onOpenChange(false);
      } catch (error) {
        console.error("Erro ao deletar:", error);
        toast.error("Erro ao excluir tarefa.");
      }
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isSubmitting) {
          onOpenChange(newOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center w-full">
            <DialogTitle>Editar Tarefa</DialogTitle>
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors text-sm font-bold"
            >
              Excluir
            </button>
          </div>
        </DialogHeader>
        <form id="update-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Título</label>
            <input
              {...register("name")}
              className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-900"
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Descrição</label>
            <textarea
              {...register("description")}
              className="w-full border border-gray-200 p-3 rounded-xl min-h-[100px] bg-gray-50 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Início</label>
              <input
                type="time"
                {...register("startTime")}
                className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-900"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Término</label>
              <input
                type="time"
                {...register("endTime")}
                className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-900"
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="update-task-form" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
