import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useSwipeable } from "react-swipeable";
import "./Cards.css";
import { getUserId } from "../RequireAuth";
import CardModal from "./CardModal";
import FastAPIClient from "../../services/FastAPIClient";

export default function Cards({ toggleLoading }: { toggleLoading: any }) {
  const { iddeck, deckTitle } = useParams();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);

  const fastAPIClient = new FastAPIClient();
  const userId = getUserId();
  let madeInitialCall = false;

  const fetchCards = async () => {
    toggleLoading(true);
    try {
      let url = `/cards/`;
      if (userId) {
        url += `?external_id=${userId}`;
      }
      if (iddeck) {
        url += (userId ? "&" : "?") + `iddeck=${iddeck}`;
      }
      const response = await fastAPIClient.get(url);
      if (!response.error) {
        setCards(response.cards);
      } else {
        console.error("Failed to fetch cards data", response.error);
        toast("Failed to fetch cards data" + response.error, {
          type: "error",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
    toggleLoading(false);
  };

  useEffect(() => {
    if (madeInitialCall) {
      return;
    }
    madeInitialCall = true;
    setRefreshing(true);
    fetchCards();
  }, [madeInitialCall]);

  const handleRefresh = async () => {
    await fetchCards();
  };

  const swipeHandlers = useSwipeable({
    onSwipedDown: (event: any) => {
      if (startY === null || event.event.touches[0]?.clientY - startY > 100) {
        handleRefresh();
      }
    },
    onSwiping: (event: any) => {
      if (startY === null) {
        setStartY(event.event.touches[0].clientY);
      }
    },
    onSwiped: () => {
      setStartY(null);
    },
  });

  const openCardModal = (card: any) => {
    setSelectedCard(card);
  };

  const closeCardModal = () => {
    setSelectedCard(null);
  };

  const handleAddCardClick = async (e: any) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    if (!title.trim() || !description.trim()) {
      toast("Please enter both title and description.", {
        type: "error",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }
    setIsLoading(true);
    try {
      let body: any = {
        title: title,
        description: description,
        external_id: userId,
      };
      if (iddeck) {
        body.deck = iddeck;
      }
      const response = await fastAPIClient.post("/card/", body);
      if (!response.error) {
        toast("Card created, refreshing", {
          className: "toast-success",
          autoClose: 1000,
          hideProgressBar: true,
        });
        setIsLoading(false);
        setTitle("");
        setDescription("");
        fetchCards();
      } else {
        console.error("Failed to add card: " + response.error);
        toast("Failed to add card", {
          className: "toast-error",
          autoClose: 1000,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
    setIsLoading(false);
  };

  // const handleDeleteDeckClick = async (e: any) => {
  //   e.preventDefault();
  //   if (isLoading) {
  //     return;
  //   }

  //   toast("Not implemented.", {
  //     type: "error",
  //     autoClose: 2000,
  //     hideProgressBar: true,
  //   });

  //   setIsLoading(false);
  // };

  const cardItemStyle = {
    textDecoration: "none",
    color: "inherit",
  };

  const renderCard = (card: any) => (
    <div
      key={card.idcard_deck}
      className={`card-item ${card.wildcard && "wildcard"}`}
      style={cardItemStyle}
      onClick={() => openCardModal(card)}
    >
      <div className="card-content">
        <h3>{card.title}</h3>
        <p>{card.description}</p>
        <p>{card.wildcard ? "Wildcard!" : ""}</p>
        {card.usercard && <div className="user-card-stamp">User card</div>}
      </div>
    </div>
  );

  return (
    <div className="Cards-main" {...swipeHandlers}>
      <div className="deck-title">{deckTitle}</div>
      <div className="cards-grid">{cards.map((card) => renderCard(card))}</div>
      {selectedCard && (
        <CardModal
          card={selectedCard}
          close={closeCardModal}
          refreshPage={fetchCards}
        />
      )}
      <div className="carousel-slide">
        <h3>New Personal Card</h3>
        <>
          <div className="input-container">
            <label className="new-card-label" htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              autoComplete="off"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
              aria-describedby="uidnote"
              className="input-field"
            />
          </div>
          <div className="input-container">
            <label className="new-card-label" htmlFor="description">
              Description
            </label>
            <input
              type="text"
              id="description"
              autoComplete="off"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
              aria-describedby="uidnote"
              className="input-field"
            />
          </div>
        </>
        <button
          className={`create-button ${isLoading ? "loading" : ""}`}
          onClick={handleAddCardClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="small spinner"></div> Creating...
            </>
          ) : (
            "Create"
          )}
        </button>
      </div>

      {/* {iddeck && (
        <button
          className={`deck-delete-button ${isLoading ? "loading" : ""}`}
          onClick={handleDeleteDeckClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="small spinner"></div> Deleting Deck...
            </>
          ) : (
            "Delete Deck"
          )}
        </button>
      )} */}
      <ToastContainer />
    </div>
  );
}
