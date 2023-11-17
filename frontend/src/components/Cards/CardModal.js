import React, { useState } from "react";
import "./CardModal.css";
import { ToastContainer, toast } from "react-toastify";
import FastAPIClient from "../../services/FastAPIClient";

export default function CardModal({ card, close, refreshPage }) {
  const [isLoading, setIsLoading] = useState(false);

  const fastAPIClient = new FastAPIClient();

  const handleDeleteCardClick = async (e) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fastAPIClient.delete(
        `/card/?idcard=${card.idcard}`
      );
      if (response.ok) {
        toast("Card deleted, refreshing", {
          className: "toast-success",
          autoClose: 1000,
          hideProgressBar: true,
        });
        setIsLoading(false);
        close();
        await refreshPage();
      } else {
        console.error("Failed to fetch cards data");
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
  };
  return (
    <div className="modal-background" onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{card.title}</h2>
        <p>{card.description}</p>
        <button className="close-button" onClick={close}>
          X
        </button>
        {card.usercard && <div className="user-card-stamp">User card</div>}
        {card.usercard && (
          <button
            className={`delete-button ${isLoading ? "loading" : ""}`}
            onClick={handleDeleteCardClick}
          >
            {isLoading ? (
              <>
                <div className="small spinner"></div> Deleting Card...
              </>
            ) : (
              "Delete Card"
            )}
          </button>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}