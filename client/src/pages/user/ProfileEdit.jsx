import { useState } from "react";
import Modal from "../../components/CustomModal";
import { TbEditCircle } from "react-icons/tb";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { editUserProfile, setUpdated } from "../../redux/user/userSlice";
import { useForm } from "react-hook-form";

const ProfileEdit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { username, email, phoneNumber, adress, _id } = useSelector(
    (state) => state.user.currentUser
  );

  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const editProfileData = async (data, id) => {
    try {
      if (data) {
        const formData = data;
        dispatch(editUserProfile({ ...formData }));
        await fetch(`/api/user/editUserProfile/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ formData }),
        });
        dispatch(setUpdated(true));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = (data) => {
    editProfileData(data, _id);
    setIsModalOpen(false);
  };

  return (
    <>
      <button 
        type="button" 
        className="p-1 hover:bg-gray-100 rounded" 
        onClick={() => setIsModalOpen(true)}
        aria-label="Editar perfil"
      >
        <TbEditCircle />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        className="bg-white mt-10 rounded-md max-w-[600px] min-w-[360px]"
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="p-8">
            <h2 className="font-bold">Haz cambios en tu perfil</h2>

            <div className="flex flex-col mx-auto md:min-w-[500px] gap-10 my-10">
              <TextField
                id="username"
                label="Nombre"
                variant="outlined"
                {...register("username")}
                defaultValue={username}
              />

              <TextField
                id="email"
                label="Email"
                variant="outlined"
                type="email"
                defaultValue={email}
                {...register("email")}
              />
              
              <TextField
                id="phoneNumber"
                label="Teléfono"
                type="tel"
                variant="outlined"
                defaultValue={phoneNumber}
                {...register("phoneNumber")}
              />

              <TextField
                id="adress"
                label="Dirección"
                multiline
                rows={4}
                defaultValue={adress}
                {...register("adress")}
              />
            </div>

            <div className="flex justify-end items-center gap-x-2">
              <button
                type="button"
                className="w-[100px] rounded-sm text-white bg-red-500 p-2 hover:bg-red-600 transition-colors"
                onClick={handleModalClose}
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="w-[100px] rounded-sm text-white bg-green-500 p-2 hover:bg-green-600 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ProfileEdit;