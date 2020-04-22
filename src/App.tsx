import React, { useState, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Column } from './components/Column';
import { CardModel } from './models/Card';
import { ColumnModel } from './models/Column';

function App() {
	const [cards, setCards] = useState<ReadonlyArray<CardModel>>([]);
	const initialColumn = new ColumnModel(Date.now(), '', 0);
	const [columns, setColumns] = useState<ReadonlyArray<ColumnModel>>([initialColumn]);
	const [highlightedColumnId, sethighlightedColumnId] = useState(0);

	const sortedColumns = useMemo(() => columns
		.slice()
		.sort((x, y) => x.BoardIndex > y.BoardIndex ? 1 : -1), [columns]);

	const setParentCards = (title: string, columnId: number, cardId: number, columnIndex: number) => {
		const card = new CardModel(cardId, title, columnId, columnIndex);
		setCards(cards.concat([card]));
	};

	const moveCard = (oldCardId: number, newCard: CardModel, oldColumnId: number) => {
		const clonedCards = cards.slice();
		const allCardsExceptOldCard = clonedCards.filter(x => x.Id !== oldCardId);

		const newColumnCards = allCardsExceptOldCard.filter(x => x.ColumnId === newCard.ColumnId);
		newColumnCards.splice(newCard.ColumnIndex, 0, newCard);
		const newCards = newColumnCards.map((x, i) => new CardModel(x.Id, x.Title, x.ColumnId, i));

		// reset column indexes on cards in the old column
		let resetCards: CardModel[] = [];
		if (newCard.ColumnId !== oldColumnId) {
			resetCards = allCardsExceptOldCard
				.filter(x => x.ColumnId === oldColumnId)
				.map((x, i) => new CardModel(x.Id, x.Title, x.ColumnId, i));
		}

		const unchangedCards = allCardsExceptOldCard
			.filter(x => x.ColumnId !== newCard.ColumnId)
			.filter(x => x.ColumnId !== oldColumnId);
		setCards(unchangedCards.concat(newCards).concat(resetCards));
	};

	const addColumn = () => {
		const clonedColumns = columns.slice();
		const newColumn = new ColumnModel(Date.now(), '', clonedColumns.length);
		clonedColumns.push(newColumn);
		setColumns(clonedColumns);
	};

	const changeColumnTitle = (columnId: number, newTitle: string, boardIndex: number) => {
		const clonedColumns = columns.slice();
		const filtered = clonedColumns.filter(x => x.Id !== columnId);
		const newColumn = new ColumnModel(columnId, newTitle, boardIndex);
		setColumns(filtered.concat([newColumn]));
	};

	const moveColumn = (oldColumnId: number, newColumn: ColumnModel) => {
		const clonedColumns = columns.slice();
		const filteredColumns = clonedColumns.filter(x => x.Id !== oldColumnId)
		filteredColumns.splice(newColumn.BoardIndex, 0, newColumn);
		const newColumns = filteredColumns.map((x, i) => new ColumnModel(x.Id, x.Title, i));
		setColumns(newColumns);
	};

	return (
		<div>
			<h1 className='logo'>Kanban Lite</h1>
			<DndProvider backend={Backend}>
				<div className='trello-container'>
					{sortedColumns.map((x, i) => 
						<div key={x.Id}>
							<Column
								columnId={x.Id}
								boardIndex={x.BoardIndex}
								highlightedColumnId={highlightedColumnId}
								title={x.Title}
								cardCount={cards.filter(y => y.ColumnId === x.Id).length}
								cards={cards}
								changeColumnTitle={(columnId: number, newTitle: string, boardIndex: number) => changeColumnTitle(columnId, newTitle, boardIndex)}
								setHighlightedColumnId={(id) => sethighlightedColumnId(id)}
								setParentCards={(title: string, columnId: number, cardId: number, columnIndex: number) => setParentCards(title, columnId, cardId, columnIndex)}
								moveCard={(oldCardId: number, newCard: CardModel, oldColumnId: number) => moveCard(oldCardId, newCard, oldColumnId)}
								moveColumn={(oldColumnId: number, newColumn: ColumnModel) => moveColumn(oldColumnId, newColumn)} />
						</div>				
					)}
					<div>
						<button
							type='button'
							onClick={() => addColumn()}
							className='btn add-column-button'>
							+ Add another list
						</button>
					</div>
				</div>
			</DndProvider>
		</div>
	);
}

export default App;