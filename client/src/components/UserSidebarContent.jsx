import { FiShoppingBag } from "react-icons/fi";
import { IoHomeOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";

export const links = [
  {
    title: "Perfil",
    links: [
      {
        name: "perfiles",
        icon: <IoHomeOutline />,
      },
      {
        name: "pedidos",
        icon: <CiHeart />
      },
      {
        name: "favoritos",
        icon: <FiShoppingBag />,
      },

     
    ],
  },
];
