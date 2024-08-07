"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Typography,
  Modal,
  Stack,
  TextField,
  Button,
} from "@mui/material";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async () => {
    const q = query(collection(firestore, "inventory"));
    const querySnapshot = await getDocs(q);
    const inventoryList = [];
    querySnapshot.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    console.log(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
      p={2}
    >
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Add New Item
      </Button>
      <Box width="80%" border="1px solid #333" borderRadius="8px">
        <Box bgcolor="#ADD8E6" p={2}>
          <Typography variant="h4" textAlign="center">
            Inventory Items
          </Typography>
        </Box>
        {inventory.map((item) => (
          <Box
            key={item.name}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            p={2}
            borderBottom="1px solid #ddd"
          >
            <Typography variant="h6">
              {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
            </Typography>
            <Typography variant="h6">{item.quantity}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => removeItem(item.name)}
            >
              Remove
            </Button>
          </Box>
        ))}
      </Box>
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
          </Stack>
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName);
              setItemName("");
              handleClose();
            }}
          >
            Add
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
