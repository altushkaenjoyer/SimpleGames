import { Link } from 'react-router-dom';
import { assetUrl } from '../api';
import Gamepad from '../images/Gamepad.png';
import Heart from '../images/Heart.png';
import Comment from '../images/Comment.png';

export default function GameCard({ game }) {
	return (
		<Link to={`/game/${game.id}`} className="game-card">
			<div className="card-icon">
				{game.icon
					? <img src={assetUrl(game.icon)} alt={game.name} />
					: <img src={Gamepad} alt={game.name} />
				}
			</div>
			<div className="card-body">
				<h3 data-text={game.name}>{game.name}</h3>
				<p className="desc">{game.description}</p>
				<div className="tags">
					{game.categories.map(cat => (
						<span key={cat} className="tag">{cat}</span>
					))}
				</div>
				<div className="stats">
					<span><img src={Heart} alt="likes"/> {game.likes.length}</span>
					<span><img src={Comment} alt="commentCount"/> {game.commentCount}</span>
				</div>
			</div>
		</Link>
	);
}
